// 文字：TextView 上的字号、颜色、字体、对齐、行数、省略号、行高、字间距、可选中、字体特性和
// 可变字体的轴、按基线定高、自动缩字号、下划线和删除线、文字阴影、测量，View 上的 textAlignment，
// 以及 Typeface。原生那一侧是 TextDomain.kt。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 照「接类的总则」（2026-11-26，docs/project.md 第 4 节）：
// - 视图上的成员都是登记的状态（ctx.defineViewState）：写什么读什么，颜色、gravity、textAlignment
//   也是；自由时只记在 JS，挂上时按登记的顺序设到原生。读排版结果的（lineCount、baseline、
//   resolvedTextSize）是页面值，自由时是 null。
// - 一件事只说一次：字号是 textSize 加 fontScaling，行高只有 lineHeight，自动缩字号合成 autoSize，
//   阴影合成 textShadow，paintFlags 拆成 isUnderlineText / isStrikeThruText。
// - 屏幕上的长度是 dp。字号、行高、首末基线、自动缩字号跟着 fontScaling：true 时按系统字号放大
//   （Java 的 sp，含 Android 14 起的非线性放大），false 时就是 dp。
// - 类型不对抛 TypeError、超出范围抛 RangeError；枚举名、颜色、可变字体轴的写法写错打警告、值不变。
//
// 字体那几项互相牵连，Java 不替我们管：换了字体，可变字体的轴不跟过去；换了字体或字号，行高和
// 首末基线（都是按当时的字体度量算的）不跟着重算；自动缩字号开着时 Java 不理 setTextSize。
// 所以挂上时按「字体 → 轴 → 字号 → 行高 → 首末基线 → 自动缩字号」的顺序设，挂着时改了前面的，
// 后面写过的跟着重设。往已有的类上加成员在这个文件里加，不改 10-view.js。
(function (ctx) {
  'use strict';

  const {
    IGNORE,
    attachedNative,
    defineNativeClass,
    defineViewState,
    describeValue,
    enumNames,
    enumProperty,
    nativeCall,
    nativeClassCallObject,
    nativeClassObject,
    nativeGet,
    nativeOnly,
    nativeSet,
    pageOf,
    parseColor,
    px,
    requireInstance,
    toInteger,
    toText,
    toTextOrNull,
  } = ctx;

  const { View, TextView } = globalThis;

  // ---- 参数转换：照 Web IDL（project.md 第 13 条）----

  function toDouble(v, what) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(what + ': expected a finite number, got ' + describeValue(v));
    return n;
  }
  function nonNegative(n, what) {
    if (n < 0) throw new RangeError(what + ': ' + n + ' is negative; expected 0 or more');
    return n;
  }
  // dp 或 null（null 是不设，用字体自己的）
  function lengthOrNull(v, what) {
    return v == null ? null : nonNegative(toDouble(v, what), what);
  }
  function isIterable(v) {
    return v !== null && typeof v === 'object' && typeof v[Symbol.iterator] === 'function';
  }
  function isObject(v) {
    return v !== null && (typeof v === 'object' || typeof v === 'function');
  }
  // 属性位写错：打一条警告，值不变
  function ignored(message) {
    console.warn('[Nacre] ' + message + ', ignored');
    return IGNORE;
  }
  // 颜色：CSS 的写法，存写进去的字符串，设到原生时再解析
  function colorState(v, what) {
    const text = toText(v);
    if (parseColor(text) === null) return ignored(what + ': ' + JSON.stringify(text) + ' is not a valid color');
    return text;
  }

  // Gravity：名字的数组，每个方向最多一个名字，外加两个裁切的开关；不收 center、fill 这种两个
  // 方向合起来的名字。名字表启动时从原生拿（Gravity.kt），措辞和那边一样。存写进去的数组（冻结的副本）
  function gravityState(v, what) {
    if (!isIterable(v)) throw new TypeError(what + ': expected an array of gravity names, got ' + describeValue(v));
    const names = Array.from(v, String);
    const horizontal = enumNames('gravityHorizontal');
    const vertical = enumNames('gravityVertical');
    const all = horizontal.concat(vertical, enumNames('gravityClip'));
    let h = null;
    let w = null;
    for (const name of names) {
      if (!all.includes(name)) {
        return ignored(what + ' has no value ' + JSON.stringify(name) + '; expected one of: ' + all.join(' / '));
      }
      if (horizontal.includes(name)) {
        if (h !== null && h !== name) {
          return ignored(what + ': ' + JSON.stringify(h) + ' and ' + JSON.stringify(name) +
                         ' are both horizontal; give at most one per direction');
        }
        h = name;
      }
      if (vertical.includes(name)) {
        if (w !== null && w !== name) {
          return ignored(what + ': ' + JSON.stringify(w) + ' and ' + JSON.stringify(name) +
                         ' are both vertical; give at most one per direction');
        }
        w = name;
      }
    }
    return Object.freeze(names);
  }

  // 可变字体的轴：CSS 的 font-variation-settings 写法，逗号隔开的「'四个字的轴名' 数」。
  // 写法不对 Java 会抛，这里先查；空串是不设
  const axisPattern = /^\s*(['"])([\x20-\x7e]{4})\1\s*[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?\s*$/;
  function variationState(v, what) {
    if (v == null) return null;
    const text = String(v);
    if (text.trim() !== '' && !text.split(',').every((part) => axisPattern.test(part))) {
      return ignored(what + ': ' + JSON.stringify(text) + ' is not a valid font-variation-settings value');
    }
    return text;
  }

  // 自动缩字号：null、{ min, max, step } 或 { sizes }（dp，跟着 fontScaling）。存冻结的副本
  function autoSizeState(v, what) {
    if (v == null) return null;
    if (!isObject(v)) {
      throw new TypeError(what + ': expected null, { min, max, step } or { sizes }, got ' + describeValue(v));
    }
    const hasSizes = v.sizes !== undefined;
    if (hasSizes && (v.min !== undefined || v.max !== undefined || v.step !== undefined)) {
      throw new TypeError(what + ': give either sizes or min, max and step, not both');
    }
    if (hasSizes) {
      if (!isIterable(v.sizes)) {
        throw new TypeError(what + '.sizes: expected an array of numbers, got ' + describeValue(v.sizes));
      }
      const sizes = Array.from(v.sizes, (n) => toDouble(n, what + '.sizes'));
      if (sizes.length === 0) throw new RangeError(what + '.sizes: expected at least one size');
      for (const n of sizes) {
        if (n <= 0) throw new RangeError(what + '.sizes: ' + n + ' is not greater than 0');
      }
      return Object.freeze({ sizes: Object.freeze(sizes) });
    }
    for (const key of ['min', 'max', 'step']) {
      if (v[key] === undefined) {
        throw new TypeError(what + ': required member ' + key + ' is missing; expected { min, max, step } or { sizes }');
      }
    }
    const min = toDouble(v.min, what + '.min');
    const max = toDouble(v.max, what + '.max');
    const step = toDouble(v.step, what + '.step');
    if (min <= 0) throw new RangeError(what + '.min: ' + min + ' is not greater than 0');
    if (max <= min) throw new RangeError(what + '.max: ' + max + ' is not greater than min (' + min + ')');
    if (step <= 0) throw new RangeError(what + '.step: ' + step + ' is not greater than 0');
    return Object.freeze({ min, max, step });
  }

  // 文字阴影：null 或 { radius, dx, dy, color }（dp，颜色是 CSS 的写法）。存冻结的副本
  function shadowState(v, what) {
    if (v == null) return null;
    if (!isObject(v)) throw new TypeError(what + ': expected null or { radius, dx, dy, color }, got ' + describeValue(v));
    for (const key of ['radius', 'dx', 'dy', 'color']) {
      if (v[key] === undefined) {
        throw new TypeError(what + ': required member ' + key + ' is missing; expected { radius, dx, dy, color }');
      }
    }
    const radius = nonNegative(toDouble(v.radius, what + '.radius'), what + '.radius');
    const dx = toDouble(v.dx, what + '.dx');
    const dy = toDouble(v.dy, what + '.dy');
    const color = toText(v.color);
    if (parseColor(color) === null) return ignored(what + '.color: ' + JSON.stringify(color) + ' is not a valid color');
    return Object.freeze({ radius, dx, dy, color });
  }

  // options 对象：null 和 undefined 当成空的
  function optionsOf(v, where) {
    if (v == null) return {};
    if (!isObject(v)) throw new TypeError("Failed to execute '" + where + "': parameter 2 is not of type 'object'.");
    return v;
  }

  // ---- Typeface ----

  // 字体。值对象：建出来就有原生对象，不分自由和挂上，不可变。不能 new（Java 也没有公开的构造），
  // 用静态的几个常量和工厂方法取
  class Typeface {
    constructor() {
      nativeOnly(new.target);
    }

    static get DEFAULT() { return nativeClassObject('Typeface', 'DEFAULT'); }
    static get SANS_SERIF() { return nativeClassObject('Typeface', 'SANS_SERIF'); }
    static get SERIF() { return nativeClassObject('Typeface', 'SERIF'); }
    static get MONOSPACE() { return nativeClassObject('Typeface', 'MONOSPACE'); }

    // family 是一个 Typeface，或者字体族的名字（'serif'、'monospace'……；null 是默认的字体族）。
    // options：weight 是 1–1000 的粗细，italic 是斜体；没给的照 family 自己的，两项都没给就是 family
    static create(family, options) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'create' on 'Typeface': 1 argument required, but only 0 present.");
      }
      const o = optionsOf(options, 'create');
      const weight = o.weight === undefined ? null : toInteger(o.weight, 'create');
      if (weight !== null && (weight < 1 || weight > 1000)) {
        throw new RangeError("Failed to execute 'create' on 'Typeface': weight " + weight + ' is out of range [1, 1000]');
      }
      const italic = o.italic === undefined ? null : Boolean(o.italic);
      if (family instanceof Typeface) {
        requireInstance(family, Typeface, 'create');
        return nativeClassCallObject('Typeface', 'create', [family, weight, italic]);
      }
      return nativeClassCallObject('Typeface', 'create', [family == null ? null : String(family), weight, italic]);
    }

    // 从项目的 assets/ 读一个字体文件（.ttf、.otf）。同步，和 Java 一样。
    // 路径相对 assets/；找不到时是 Java 抛的异常
    static createFromAsset(path) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'createFromAsset' on 'Typeface': 1 argument required, but only 0 present.");
      }
      return nativeClassCallObject('Typeface', 'createFromAsset', [toText(path)]);
    }

    get weight() { return nativeGet(this, 'weight'); }
    get isItalic() { return nativeGet(this, 'isItalic'); }
  }
  defineNativeClass('Typeface', Typeface);

  // ---- 设到原生：字体那几项 ----

  // 字体和可变字体的轴总是一起设（原生先清掉上一次的轴，换回这里的字体，再设轴）
  function setFont(standIn, view) {
    nativeCall(standIn, '@font', [view.typeface, view.fontVariationSettings]);
  }
  function setTextSize(standIn, view) {
    nativeCall(standIn, '@textSize', [view.textSize, view.fontScaling]);
  }
  function setLineHeight(standIn, view) {
    nativeCall(standIn, '@lineHeight', [view.lineHeight, view.fontScaling]);
  }
  // 首末基线靠改上下内边距实现：写了的一边盖过 paddingTop / paddingBottom，null 的一边用 JS 的内边距
  function setBaselines(standIn, page, view) {
    nativeCall(standIn, '@baselines', [view.firstBaselineToTopHeight, view.lastBaselineToBottomHeight,
      view.fontScaling, px(page, view.paddingTop), px(page, view.paddingBottom)]);
  }
  function hasBaselines(view) {
    return view.firstBaselineToTopHeight !== null || view.lastBaselineToBottomHeight !== null;
  }
  // 按字体度量算出来的（行高、首末基线）：字体、字号变了之后重设写过的
  function refreshMetrics(standIn, page, view) {
    if (view.lineHeight !== null) setLineHeight(standIn, view);
    if (hasBaselines(view)) setBaselines(standIn, page, view);
  }
  function setAutoSize(standIn, view) {
    const a = view.autoSize;
    if (a === null) nativeCall(standIn, '@autoSize', [null]);
    else if (a.sizes !== undefined) nativeCall(standIn, '@autoSize', ['sizes', Array.from(a.sizes), view.fontScaling]);
    else nativeCall(standIn, '@autoSize', ['range', a.min, a.max, a.step, view.fontScaling]);
  }

  // ---- TextView 上的状态 ----
  //
  // order：基础的文字是 500。字体 510、轴 511、字号 520、行高 530、首末基线 540、外观 550、
  // 对齐 560、行数 570、可选中 580、自动缩字号最后（590：开着时 Java 不理 setTextSize）

  // 字体：Typeface，或 null（系统默认的字体）。没写过时是 Typeface.DEFAULT（实测：新建的 TextView
  // 的字体就是它）
  defineViewState(TextView, 'typeface', {
    order: 510,
    initial: Typeface.DEFAULT,
    convert: (v, what) => (v == null ? null : requireInstance(v, Typeface, what)),
    apply: (standIn, value, page, view) => {
      setFont(standIn, view);
      refreshMetrics(standIn, page, view);
    },
  });

  // 可变字体的轴，CSS 的 font-variation-settings 写法（"'wght' 700"）；null 是不设。
  // 没有一个字体认得的轴和没设一样
  defineViewState(TextView, 'fontVariationSettings', {
    order: 511,
    initial: null,
    convert: variationState,
    apply: (standIn, value, page, view) => {
      setFont(standIn, view);
      refreshMetrics(standIn, page, view);
    },
  });

  // 字体特性，CSS 的 font-feature-settings 写法（"'tnum'" 是等宽数字）；null 是不设
  defineViewState(TextView, 'fontFeatureSettings', {
    order: 512,
    initial: null,
    convert: (v) => toTextOrNull(v),
    apply: (standIn, value) => nativeSet(standIn, 'fontFeatureSettings', value),
  });

  // 字号：系统字号为 1 时的 dp。默认 14（主题给的）。没写过也设：主题给的是建的时候取整的像素，
  // 系统字号变了它不跟着变（实测）
  defineViewState(TextView, 'textSize', {
    order: 520,
    initial: 14,
    units: 'sp',
    applyInitial: true,
    convert: (v, what) => nonNegative(toDouble(v, what), what),
    apply: (standIn, value, page, view) => {
      setTextSize(standIn, view);
      refreshMetrics(standIn, page, view);
    },
  });

  // 字号、行高、首末基线、自动缩字号跟不跟着系统字号放大
  defineViewState(TextView, 'fontScaling', {
    order: 520,
    initial: true,
    units: 'sp',
    convert: (v) => Boolean(v),
    apply: (standIn, value, page, view) => {
      setTextSize(standIn, view);
      if (view.autoSize !== null) setAutoSize(standIn, view);
      refreshMetrics(standIn, page, view);
    },
  });

  // 字间距，单位是 em（字号的倍数）
  defineViewState(TextView, 'letterSpacing', {
    order: 525,
    initial: 0,
    convert: (v, what) => toDouble(v, what),
    apply: (standIn, value) => nativeSet(standIn, 'letterSpacing', value),
  });

  // 行的上下要不要留出字体自带的余量（给重音符号这类高出来的字）
  defineViewState(TextView, 'includeFontPadding', {
    order: 526,
    initial: true,
    convert: (v) => Boolean(v),
    apply: (standIn, value, page, view) => {
      nativeSet(standIn, 'includeFontPadding', value);
      if (hasBaselines(view)) setBaselines(standIn, page, view);
    },
  });

  // 行高，dp（跟着 fontScaling）；null 是字体自己的行高
  defineViewState(TextView, 'lineHeight', {
    order: 530,
    initial: null,
    units: 'sp',
    convert: lengthOrNull,
    apply: (standIn, value, page, view) => setLineHeight(standIn, view),
  });

  // 第一行的基线到视图顶边、最后一行的基线到底边的距离，dp（跟着 fontScaling）；null 是不设
  for (const name of ['firstBaselineToTopHeight', 'lastBaselineToBottomHeight']) {
    defineViewState(TextView, name, {
      order: 540,
      initial: null,
      units: 'sp',
      convert: lengthOrNull,
      apply: (standIn, value, page, view) => setBaselines(standIn, page, view),
    });
  }

  // 文字颜色、选中文字时的底色。默认值是 AOSP 主题（Theme.Material.Light）给的，实测
  defineViewState(TextView, 'textColor', {
    order: 550,
    initial: '#000000de',
    convert: colorState,
    apply: (standIn, value) => nativeSet(standIn, 'textColor', parseColor(value)),
  });
  defineViewState(TextView, 'highlightColor', {
    order: 550,
    initial: '#00857766',
    convert: colorState,
    apply: (standIn, value) => nativeSet(standIn, 'highlightColor', parseColor(value)),
  });

  // 文字阴影：模糊半径、横向和纵向的偏移（dp），颜色
  defineViewState(TextView, 'textShadow', {
    order: 550,
    initial: null,
    units: 'dp',
    convert: shadowState,
    apply: (standIn, value, page) => {
      if (value === null) nativeCall(standIn, '@textShadow', [null]);
      else nativeCall(standIn, '@textShadow', [value.radius * page.density, value.dx * page.density,
        value.dy * page.density, parseColor(value.color)]);
    },
  });

  // 下划线、删除线
  for (const name of ['isUnderlineText', 'isStrikeThruText']) {
    defineViewState(TextView, name, {
      order: 550,
      initial: false,
      convert: (v) => Boolean(v),
      apply: (standIn, value) => nativeSet(standIn, name, value),
    });
  }

  // 文字在视图里怎么放：名字的数组
  defineViewState(TextView, 'gravity', {
    order: 560,
    initial: Object.freeze(['start', 'top']),
    convert: gravityState,
    apply: (standIn, value) => nativeSet(standIn, 'gravity', Array.from(value)),
  });

  // 最多几行；null 是不限
  defineViewState(TextView, 'maxLines', {
    order: 570,
    initial: null,
    convert: (v, what) => (v == null ? null : nonNegative(toInteger(v, what), what)),
    apply: (standIn, value) => nativeSet(standIn, 'maxLines', value),
  });
  // 至少占几行的高度
  defineViewState(TextView, 'minLines', {
    order: 570,
    initial: 0,
    convert: (v, what) => nonNegative(toInteger(v, what), what),
    apply: (standIn, value) => nativeSet(standIn, 'minLines', value),
  });
  // 放不下时在哪里加省略号；null 是不加
  defineViewState(TextView, 'ellipsize', {
    order: 570,
    initial: null,
    convert: (v, what) => (v == null ? null : enumProperty('ellipsize', v, what)),
    apply: (standIn, value) => nativeSet(standIn, 'ellipsize', value),
  });

  // 用户能不能长按选中文字、复制
  defineViewState(TextView, 'isTextSelectable', {
    order: 580,
    initial: false,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, 'isTextSelectable', value),
  });

  // 自动缩字号：放不下时在一组字号里挑能放下的最大的。null、{ min, max, step } 或 { sizes }。
  // 关掉时把 textSize（开着时写的也算）设回去
  defineViewState(TextView, 'autoSize', {
    order: 590,
    initial: null,
    units: 'sp',
    convert: autoSizeState,
    apply: (standIn, value, page, view) => {
      setAutoSize(standIn, view);
      if (value === null) {
        setTextSize(standIn, view);
        refreshMetrics(standIn, page, view);
      }
    },
  });

  // 内边距一改，原生的上下内边距就按 JS 的值重设了：写了首末基线的要跟着重算（基线定高盖过内边距）
  for (const name of ['paddingTop', 'paddingBottom', 'paddingStart', 'paddingEnd']) {
    const base = Object.getOwnPropertyDescriptor(View.prototype, name);
    Object.defineProperty(TextView.prototype, name, {
      get: base.get,
      set(v) {
        base.set.call(this, v);
        const standIn = attachedNative(this);
        if (standIn !== null && hasBaselines(this)) setBaselines(standIn, pageOf(this.activity), this);
      },
      enumerable: false,
      configurable: true,
    });
  }

  // ---- 页面值：排版的结果，自由时是 null ----

  function pageValue(view, name) {
    const standIn = attachedNative(view);
    return standIn === null ? null : nativeGet(standIn, name);
  }
  class TextViewPageValues {
    // 实际画字用的字号（dp）：算进了系统字号和自动缩字号
    get resolvedTextSize() { return pageValue(this, 'resolvedTextSize'); }
    // 排了几行；还没排过版时也是 null
    get lineCount() { return pageValue(this, 'lineCount'); }
    // 第一行的基线到视图顶边的距离（dp）；还没排过版时也是 null
    get baseline() { return pageValue(this, 'baseline'); }
  }
  const descriptors = Object.getOwnPropertyDescriptors(TextViewPageValues.prototype);
  delete descriptors.constructor;
  Object.defineProperties(TextView.prototype, descriptors);

  // ---- View 上的 textAlignment ----

  // 文字怎么对齐。读回写进去的值（'inherit' 也是）
  defineViewState(View, 'textAlignment', {
    order: 560,
    initial: 'gravity',
    convert: (v, what) => enumProperty('textAlignment', v, what),
    apply: (standIn, value) => nativeSet(standIn, 'textAlignment', value),
  });
})
