// 颜色：上层写法是字符串
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    defineNativeClass,
    nativeCall,
    nativeClassCall,
    nativeClassObject,
    nativeOnly,
  } = ctx;

  const UIColor = defineNativeClass('UIColor', class UIColor extends NSObject {
    constructor() { nativeOnly(new.target); }
  });
  const COLOR_CONSTANTS = [
    // UIColor.h：基础色
    'blackColor', 'darkGrayColor', 'lightGrayColor', 'whiteColor', 'grayColor',
    'redColor', 'greenColor', 'blueColor', 'cyanColor', 'yellowColor',
    'magentaColor', 'orangeColor', 'purpleColor', 'brownColor', 'clearColor',
    // UIInterface.h：系统色
    'systemRedColor', 'systemGreenColor', 'systemBlueColor', 'systemOrangeColor',
    'systemYellowColor', 'systemPinkColor', 'systemPurpleColor', 'systemTealColor',
    'systemIndigoColor', 'systemBrownColor', 'systemMintColor', 'systemCyanColor',
    'systemGrayColor',
    // UIInterface.h：语义色
    'labelColor', 'secondaryLabelColor', 'tertiaryLabelColor', 'quaternaryLabelColor',
    'placeholderTextColor', 'separatorColor', 'opaqueSeparatorColor', 'linkColor',
    'systemBackgroundColor', 'secondarySystemBackgroundColor',
    'tertiarySystemBackgroundColor',
  ];
  for (const name of COLOR_CONSTANTS) {
    Object.defineProperty(UIColor, name, {
      configurable: true,
      enumerable: false,
      get: () => nativeClassObject('UIColor', name),
    });
  }


  // ---------- 颜色：上层是字符串 ----------
  //
  // 属性读写都是字符串，`UIColor` 类仍然在全局（只挂常量、不可实例化），
  // setter 两种都收。**解析在 JS 侧做**（纯文本运算），过桥的是规范化的 spec。
  //
  // 两张弱表互为反函数：
  //   colorDecls  包装 → 写它时用的那个串     「合法就原样还你」靠它
  //   colorPool   串   → WeakRef<包装>        同一个串永远同一个对象
  // 键挂在**颜色**上而不是 view 上，所以一个颜色给多少个 view 都还是那个串；
  // 声明丢失的唯一条件是「所有持有者都没了」，而那时也没人读得到它。
  const colorDecls = new WeakMap();
  const colorPool = new Map();
  // 按**值**查的回退。实测：UIView.backgroundColor 这类属性对普通 RGB 颜色
  // 读回来不是同一个对象——UIKit 自己规范化了一道（和 layer.borderColor 过
  // CGColor 是同一个现象）。所以光按对象身份存声明不够，还要按值兜一层。
  // 代价是同一个颜色值的不同写法共用一条声明，最后写的那个赢。
  const colorByValue = new Map();
  function colorValueKey(spec) {
    if (spec.kind === 'rgba') {
      const q = (v) => Math.round(v * 1e6);
      return 'rgba:' + q(spec.r) + ',' + q(spec.g) + ',' + q(spec.b) + ',' + q(spec.a);
    }
    // 语义色**不进**这张表：它合成出来就是规范的短名，不需要回退。
    // 放进去的话，别人用全名 'systemRedColor' 写过一次之后，后面所有
    // 直接写 UIColor 对象的地方都会读回那个拼法——不该有这种串台
    return null;   // 语义色、动态色、表达不出来的都不进
  }
  // 表达不出来的颜色（没名字的动态色、图案色、HDR）按代号往返。
  // 强引用：它们是 getter 吐出去的，必须能赋回来。实测一次都不该触发
  const opaqueColors = new Map();
  const opaqueIds = new WeakMap();
  let opaqueNext = 1;
  const colorPoolCleanup =
    typeof FinalizationRegistry === 'function'
      ? new FinalizationRegistry((text) => {
          const ref = colorPool.get(text);
          if (ref !== undefined && ref.deref() === undefined) colorPool.delete(text);
        })
      : null;

  // 短名 ↔ 常量名：'systemBackground' ↔ 'systemBackgroundColor'。
  // 和枚举「去前缀、首字母小写」同一个态度——字符串是写给人看的简写。
  //
  // **只认短名**。写全名 'systemPinkColor' 不合法，照不合法处理（警告 +
  // 保留旧值）。认两种拼法的话「合法就原样还你」就得为语义色开一个例外，
  // 而语义色是共享单例，记住某一个调用方的拼法会串到所有读它的人
  const colorShortToFull = new Map();
  const colorFullToShort = new Map();
  for (const full of COLOR_CONSTANTS) {
    const short = full.endsWith('Color') ? full.slice(0, -5) : full;
    colorShortToFull.set(short, full);
    colorFullToShort.set(full, short);
  }

  function colorWarn(what, text) {
    let hint = '';
    // 写的像个名字（没有 # 也没有括号）就把能用的名字列出来——和枚举
    // 写错时列可选值是同一个态度。写的是 '#GGG' 就不列：那时用户问的
    // 不是「有哪些名字」
    if (typeof text === 'string' && /^[A-Za-z][A-Za-z0-9]*$/.test(text)) {
      hint = '; expected a color name, one of: ' +
             [...colorFullToShort.values()].join(' / ');
    }
    console.warn('[Nacre] ' + what + ': ' + JSON.stringify(text) +
                 ' is not a valid color, ignored' + hint);
  }

  // 按括号深度切顶层逗号——light-dark(rgb(1,2,3), #000) 里面还有逗号
  function splitTopLevel(text) {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ',' && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
    }
    parts.push(text.slice(start));
    return parts.map((p) => p.trim());
  }

  /** 0-255 或百分比 → 0..1 */
  function colorChannel(token) {
    const t = token.trim();
    if (t.endsWith('%')) {
      const n = Number(t.slice(0, -1));
      return Number.isFinite(n) ? n / 100 : null;
    }
    const n = Number(t);
    return Number.isFinite(n) ? n / 255 : null;
  }
  /** 0-1 或百分比 */
  function colorAlpha(token) {
    const t = token.trim();
    if (t.endsWith('%')) {
      const n = Number(t.slice(0, -1));
      return Number.isFinite(n) ? n / 100 : null;
    }
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  /** 字符串 → spec，认不出给 null */
  function parseColorText(text) {
    const t = String(text).trim();
    if (t === '') return null;

    if (t[0] === '#') {
      const hex = t.slice(1);
      if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
      const expand = (c) => parseInt(c + c, 16) / 255;
      const pair = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
      if (hex.length === 3 || hex.length === 4) {
        return { kind: 'rgba', r: expand(hex[0]), g: expand(hex[1]), b: expand(hex[2]),
                 a: hex.length === 4 ? expand(hex[3]) : 1 };
      }
      if (hex.length === 6 || hex.length === 8) {
        return { kind: 'rgba', r: pair(0), g: pair(2), b: pair(4),
                 a: hex.length === 8 ? pair(6) : 1 };
      }
      return null;
    }

    const call = /^([a-z-]+)\s*\((.*)\)$/is.exec(t);
    if (call) {
      const fn = call[1].toLowerCase();
      const inner = call[2];
      if (fn === 'rgb' || fn === 'rgba') {
        // 逗号式和空格式都认；空格式的 alpha 写在 / 后面
        let tokens;
        if (inner.includes(',')) {
          tokens = splitTopLevel(inner);
        } else {
          const bySlash = inner.split('/');
          tokens = bySlash[0].trim().split(/\s+/);
          if (bySlash.length > 1) tokens.push(bySlash[1].trim());
        }
        if (tokens.length !== 3 && tokens.length !== 4) return null;
        const r = colorChannel(tokens[0]);
        const g = colorChannel(tokens[1]);
        const b = colorChannel(tokens[2]);
        const a = tokens.length === 4 ? colorAlpha(tokens[3]) : 1;
        if (r === null || g === null || b === null || a === null) return null;
        return { kind: 'rgba', r, g, b, a };
      }
      if (fn === 'light-dark') {
        const parts = splitTopLevel(inner);
        if (parts.length !== 2) return null;
        const light = parseColorText(parts[0]);
        const dark = parseColorText(parts[1]);
        if (light === null || dark === null) return null;
        return { kind: 'lightDark', light, dark };
      }
      if (fn === 'asset') {
        const name = inner.trim();
        return name === '' ? null : { kind: 'asset', name };
      }
      if (fn === 'native') {
        const id = Number(inner.trim());
        return Number.isInteger(id) ? { kind: 'native', id } : null;
      }
      return null;
    }

    const full = colorShortToFull.get(t);
    return full === undefined ? null : { kind: 'name', name: full };
  }

  /** 字符串 → UIColor，认不出给 null。同一个串永远同一个对象 */
  function colorFromString(text) {
    const cached = colorPool.get(text);
    if (cached !== undefined) {
      const hit = cached.deref();
      if (hit !== undefined) return hit;
      colorPool.delete(text);
    }
    const spec = parseColorText(text);
    if (spec === null) return null;
    if (spec.kind === 'native') {
      return opaqueColors.get(spec.id) || null;
    }
    const color = nativeClassCall('UIColor', 'nacreFromSpec', [spec]);
    if (color === null) return null;
    // 语义色**不记声明**。它是原生单例，在它上面记状态就是全局状态。
    // 而且不需要记：只认短名，所以合成出来的短名就是你写的那个
    if (spec.kind !== 'name') {
      colorDecls.set(color, text);
      const key = colorValueKey(spec);
      if (key !== null) colorByValue.set(key, text);
    }
    colorPool.set(text, new WeakRef(color));
    if (colorPoolCleanup) colorPoolCleanup.register(color, text);
    return color;
  }

  function colorTextForSpec(spec, color) {
    if (spec.kind === 'name') return colorFullToShort.get(spec.name) || spec.name;
    if (spec.kind === 'rgba') {
      const byte = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255);
      if (spec.a >= 1) {
        const hex = (v) => byte(v).toString(16).padStart(2, '0');
        return '#' + hex(spec.r) + hex(spec.g) + hex(spec.b);
      }
      return 'rgba(' + byte(spec.r) + ', ' + byte(spec.g) + ', ' + byte(spec.b) + ', ' +
             Math.round(spec.a * 1000) / 1000 + ')';
    }
    // 表达不出来。给个代号，保证往返，并且诚实地说「这个写不出来」
    let id = opaqueIds.get(color);
    if (id === undefined) {
      id = opaqueNext++;
      opaqueIds.set(color, id);
      opaqueColors.set(id, color);
    }
    return 'native(' + id + ')';
  }

  /** UIColor → 字符串。写进去时用的那个串原样还回来 */
  function colorString(color) {
    if (color === null || color === undefined) return null;
    const decl = colorDecls.get(color);
    if (decl !== undefined) return decl;
    // 原生自己给的颜色（UIKit 的默认值、tintColor 继承…）没有声明串，
    // 按它的事实合成一个，并记下来——下次不用再过桥
    const spec = nativeCall(color, 'nacreSpec', []);
    // 对象身份没了，再按值找一次——这条救的是被 UIKit 规范化过的普通颜色
    const key = colorValueKey(spec);
    const byValue = key === null ? undefined : colorByValue.get(key);
    const text = byValue !== undefined ? byValue : colorTextForSpec(spec, color);
    colorDecls.set(color, text);
    return text;
  }

  /**
   * 颜色参数。给 undefined 表示「不合法，别写」——按已定的决定**不抛**，
   * 打一条警告。纯静默的话「写错了读回来还是旧值、一点提示都没有」，
   * 那正是这个项目一路在消灭的错。
   */
  function colorArg(value, what) {
    if (value === null || value === undefined) return null;
    if (value instanceof UIColor) return value;
    if (typeof value !== 'string') { colorWarn(what, value); return undefined; }
    const color = colorFromString(value);
    if (color === null) { colorWarn(what, value); return undefined; }
    return color;
  }

  // 场景的持久身份。场景对象会被系统销毁重建，session 活得更久——
  // persistentIdentifier 用来认出「是不是之前那个窗口」。

  // 这个 part 对外提供的东西
  Object.assign(ctx, { colorArg, colorString });
})
