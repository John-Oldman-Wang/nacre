// 外观：View 的背景、透明度、可见性、高度和阴影、轮廓和裁切、变换；Drawable 一族
// （Drawable、ColorDrawable、GradientDrawable、RippleDrawable）；RenderEffect 的模糊
// （Android 12 起，11 上没有这个类，View 上也没有 setRenderEffect）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 颜色写成 CSS 的字符串，在这里解析（纯文本运算），过桥的是 ARGB 的无符号整数；读出来
// 规范化成小写的 '#rrggbb'（不透明）或 '#rrggbbaa'。属性写错打警告、值不变；方法参数
// 和构造写错抛 TypeError。解析的几个函数放在 ctx 上，排在后面的组也能用。
//
// 原生那一侧是 android/runtime 的 AppearanceDomain.kt。单位是像素，角度是度。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    defineNativeClass,
    describeValue,
    nativeCall,
    nativeCallObject,
    nativeClassCallValue,
    nativeClassNames,
    nativeGet,
    nativeSet,
    own,
    requireInstance,
    toInteger,
    toText,
  } = ctx;
  // 10-view.js 定义的，挂在全局
  const { View } = globalThis;

  // ---- 颜色 ----

  // 0–255 或百分比 → 0–255 的整数（超出范围的照 CSS 夹到范围里）
  function channel(token) {
    const t = token.trim();
    const n = t.endsWith('%') ? Number(t.slice(0, -1)) * 2.55 : Number(t);
    if (t === '' || !Number.isFinite(n)) return null;
    return Math.round(Math.min(255, Math.max(0, n)));
  }
  // 0–1 或百分比 → 0–255 的整数
  function alphaChannel(token) {
    const t = token.trim();
    const n = t.endsWith('%') ? Number(t.slice(0, -1)) / 100 : Number(t);
    if (t === '' || !Number.isFinite(n)) return null;
    return Math.round(Math.min(1, Math.max(0, n)) * 255);
  }
  const argbOf = (a, r, g, b) => ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;

  // CSS 的颜色字符串 → ARGB（0–0xFFFFFFFF）。认不出给 null。
  // 认：#rgb、#rgba、#rrggbb、#rrggbbaa（透明度在最后，和 CSS 一样，和 Android 的
  // Color.parseColor 相反）、rgb() / rgba() 的逗号写法和空格写法、transparent
  function parseColor(text) {
    const t = String(text).trim();
    if (t.toLowerCase() === 'transparent') return 0;
    if (t[0] === '#') {
      const hex = t.slice(1);
      if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
      const one = (i) => parseInt(hex[i] + hex[i], 16);
      const two = (i) => parseInt(hex.slice(i, i + 2), 16);
      if (hex.length === 3) return argbOf(255, one(0), one(1), one(2));
      if (hex.length === 4) return argbOf(one(3), one(0), one(1), one(2));
      if (hex.length === 6) return argbOf(255, two(0), two(2), two(4));
      if (hex.length === 8) return argbOf(two(6), two(0), two(2), two(4));
      return null;
    }
    const call = /^(rgba?)\s*\((.*)\)$/is.exec(t);
    if (call === null) return null;
    const inner = call[2];
    let tokens;
    if (inner.includes(',')) {
      tokens = inner.split(',');
    } else {
      const bySlash = inner.split('/');
      if (bySlash.length > 2) return null;
      tokens = bySlash[0].trim().split(/\s+/);
      if (bySlash.length === 2) tokens.push(bySlash[1]);
    }
    if (tokens.length !== 3 && tokens.length !== 4) return null;
    const r = channel(tokens[0]);
    const g = channel(tokens[1]);
    const b = channel(tokens[2]);
    const a = tokens.length === 4 ? alphaChannel(tokens[3]) : 255;
    if (r === null || g === null || b === null || a === null) return null;
    return argbOf(a, r, g, b);
  }

  // ARGB → '#rrggbb'（不透明）或 '#rrggbbaa'
  function colorText(argb) {
    const v = argb >>> 0;
    const hex = (n) => n.toString(16).padStart(2, '0');
    const a = v >>> 24;
    const rgb = '#' + hex((v >>> 16) & 255) + hex((v >>> 8) & 255) + hex(v & 255);
    return a === 255 ? rgb : rgb + hex(a);
  }

  // 属性位：写错打一条警告，返回 null（调用的地方就不过桥，值不变）
  function colorProperty(what, value) {
    const text = toText(value);
    const argb = parseColor(text);
    if (argb === null) {
      console.warn('[Nacre] ' + what + ': ' + JSON.stringify(text) + ' is not a valid color, ignored');
    }
    return argb;
  }
  // 方法参数和构造：写错抛 TypeError
  function colorArgument(what, value) {
    const text = toText(value);
    const argb = parseColor(text);
    if (argb === null) throw new TypeError(what + ': ' + JSON.stringify(text) + ' is not a valid color');
    return argb;
  }

  // ---- 参数转换：照 Web IDL ----

  // 数：Number() 后要是有限数
  function toNumber(v, where) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(where + ': expected a finite number, got ' + describeValue(v));
    return n;
  }
  // 序列（Web IDL 的 sequence）：要是可迭代的对象；字符串不算
  function toSequence(v, where) {
    if (v === null || typeof v !== 'object' || typeof v[Symbol.iterator] !== 'function') {
      throw new TypeError(where + ': expected an array, got ' + describeValue(v));
    }
    return Array.from(v);
  }
  function requireArgs(args, count, what) {
    if (args.length < count) {
      throw new TypeError("Failed to execute '" + what + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + args.length + ' present.');
    }
  }
  // 可空的 Drawable 参数
  function drawableOrNull(v, where) {
    return v == null ? null : requireInstance(v, Drawable, where);
  }

  // 往已有的类上加成员：访问器 { name: [get, set] }，方法 { name: fn }。照 class 语法的样子，
  // 不可枚举
  function addAccessors(proto, accessors) {
    for (const [name, [get, set]] of Object.entries(accessors)) {
      Object.defineProperty(proto, name, { get, set, enumerable: false, configurable: true });
    }
  }
  function addMethods(proto, methods) {
    for (const [name, value] of Object.entries(methods)) {
      Object.defineProperty(proto, name, { value, writable: true, enumerable: false, configurable: true });
    }
  }

  // 数值属性：读原生的，写之前照 Web IDL 转成数
  const numberProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toNumber(v, name)); },
  ];
  const integerProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toInteger(v, name)); },
  ];
  const booleanProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, Boolean(v)); },
  ];
  // 枚举属性：原样转成字符串交过去，不认识的由原生打警告
  const enumProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toText(v)); },
  ];
  const colorProp = (name) => [
    function () { return colorText(nativeGet(this, name)); },
    function (v) {
      const argb = colorProperty(name, v);
      if (argb !== null) nativeSet(this, name, argb);
    },
  ];
  const readOnly = (name) => [function () { return nativeGet(this, name); }, undefined];

  // ---- Drawable 一族 ----

  // 原型链上离 cls 最近的原生类
  function nearestNative(cls) {
    let c = cls;
    while (typeof c === 'function' && !nativeClassNames.has(c)) c = Object.getPrototypeOf(c);
    return c;
  }

  class Drawable {
    constructor() {
      if (nearestNative(new.target) === Drawable) {
        throw new TypeError('Illegal constructor: Drawable is abstract and cannot be constructed; ' +
                            'use ColorDrawable, GradientDrawable or RippleDrawable');
      }
    }
  }
  addAccessors(Drawable.prototype, {
    // 不透明度，0–255
    alpha: integerProp('alpha'),
    // 固有尺寸，像素；没有固有尺寸是 -1
    intrinsicWidth: readOnly('intrinsicWidth'),
    intrinsicHeight: readOnly('intrinsicHeight'),
  });
  defineNativeClass('Drawable', Drawable);

  class ColorDrawable extends Drawable {
    constructor(color) {
      super();
      const args = color === undefined ? [] : [colorArgument("Failed to construct 'ColorDrawable'", color)];
      constructNative(this, new.target, 'ColorDrawable', args);
    }
  }
  addAccessors(ColorDrawable.prototype, { color: colorProp('color') });
  defineNativeClass('ColorDrawable', ColorDrawable);

  class GradientDrawable extends Drawable {
    // new GradientDrawable() 或 new GradientDrawable(orientation, colors)，照 Java 的两个构造
    constructor(orientation, colors) {
      super();
      let args = [];
      if (arguments.length > 0) {
        requireArgs(arguments, 2, 'GradientDrawable');
        const where = "Failed to construct 'GradientDrawable'";
        args = [toText(orientation), toSequence(colors, where).map((c) => colorArgument(where, c))];
      }
      constructNative(this, new.target, 'GradientDrawable', args);
    }

    // 带位置的渐变：offsets 是 0–1 的数，个数和颜色一样；给 null 是均匀分布
    setColors(colors, offsets) {
      requireArgs(arguments, 2, 'setColors');
      const c = toSequence(colors, 'setColors').map((v) => colorArgument('setColors', v));
      let o = null;
      if (offsets != null) {
        o = toSequence(offsets, 'setColors').map((v) => toNumber(v, 'setColors'));
        if (o.length !== c.length) {
          throw new RangeError('setColors: ' + c.length + ' colors but ' + o.length + ' offsets');
        }
      }
      nativeCall(this, 'setColors', [c, o]);
    }

    // 渐变中心，0–1，相对于自己的大小
    setGradientCenter(x, y) {
      requireArgs(arguments, 2, 'setGradientCenter');
      nativeCall(this, 'setGradientCenter', [toNumber(x, 'setGradientCenter'), toNumber(y, 'setGradientCenter')]);
    }

    // 边框：setStroke(width, color) 或 setStroke(width, color, dashWidth, dashGap)
    setStroke(width, color, dashWidth, dashGap) {
      if (arguments.length !== 2 && arguments.length !== 4) {
        throw new TypeError("Failed to execute 'setStroke': expected 2 or 4 arguments, got " + arguments.length);
      }
      const args = [toInteger(width, 'setStroke'), colorArgument('setStroke', color)];
      if (arguments.length === 4) args.push(toNumber(dashWidth, 'setStroke'), toNumber(dashGap, 'setStroke'));
      nativeCall(this, 'setStroke', args);
    }

    // 固有尺寸，像素
    setSize(width, height) {
      requireArgs(arguments, 2, 'setSize');
      nativeCall(this, 'setSize', [toInteger(width, 'setSize'), toInteger(height, 'setSize')]);
    }
  }
  addAccessors(GradientDrawable.prototype, {
    shape: enumProp('shape'),
    // 纯色；设了渐变时是 null
    color: [
      function () {
        const argb = nativeGet(this, 'color');
        return argb === null ? null : colorText(argb);
      },
      colorProp('color')[1],
    ],
    // 渐变的颜色；纯色时是 null。有一个写错，整次不生效
    colors: [
      function () {
        const list = nativeGet(this, 'colors');
        return list === null ? null : list.map(colorText);
      },
      function (v) {
        if (v === null) { nativeSet(this, 'colors', null); return; }
        const list = toSequence(v, 'colors');
        const argbs = [];
        for (const c of list) {
          const argb = colorProperty('colors', c);
          if (argb === null) return;
          argbs.push(argb);
        }
        nativeSet(this, 'colors', argbs);
      },
    ],
    gradientType: enumProp('gradientType'),
    orientation: enumProp('orientation'),
    gradientCenterX: readOnly('gradientCenterX'),
    gradientCenterY: readOnly('gradientCenterY'),
    gradientRadius: numberProp('gradientRadius'),
    cornerRadius: numberProp('cornerRadius'),
    // 四个角各两个半径（横、竖），从左上角顺时针；统一用 cornerRadius 时是 null
    cornerRadii: [
      function () { return nativeGet(this, 'cornerRadii'); },
      function (v) {
        if (v === null) { nativeSet(this, 'cornerRadii', null); return; }
        const radii = toSequence(v, 'cornerRadii').map((r) => toNumber(r, 'cornerRadii'));
        if (radii.length !== 8) throw new RangeError('cornerRadii: expected 8 values, got ' + radii.length);
        nativeSet(this, 'cornerRadii', radii);
      },
    ],
    innerRadius: integerProp('innerRadius'),
    innerRadiusRatio: numberProp('innerRadiusRatio'),
    thickness: integerProp('thickness'),
    thicknessRatio: numberProp('thicknessRatio'),
    useLevel: booleanProp('useLevel'),
  });
  defineNativeClass('GradientDrawable', GradientDrawable);

  // 按下效果。内容和遮罩只能在构造时给（照 Java 的构造，按位置传），可以是 null
  class RippleDrawable extends Drawable {
    constructor(color, content, mask) {
      super();
      requireArgs(arguments, 1, 'RippleDrawable');
      const where = "Failed to construct 'RippleDrawable'";
      const c = drawableOrNull(content, where);
      const m = drawableOrNull(mask, where);
      constructNative(this, new.target, 'RippleDrawable', [colorArgument(where, color), c, m]);
      // 水波持有它的内容和遮罩
      own(this, 'content', c);
      own(this, 'mask', m);
    }

    setColor(color) {
      requireArgs(arguments, 1, 'setColor');
      nativeCall(this, 'setColor', [colorArgument('setColor', color)]);
    }
  }
  addAccessors(RippleDrawable.prototype, {
    // 水波的最大半径，像素；'auto' 是按视图的大小定
    radius: [
      function () { return nativeGet(this, 'radius'); },
      function (v) { nativeSet(this, 'radius', typeof v === 'string' ? v : toInteger(v, 'radius')); },
    ],
  });
  defineNativeClass('RippleDrawable', RippleDrawable);

  // ---- View 上加的 ----

  // 背景和前景：视图持有它们。读的时候也记一条边：setBackgroundColor 建的 ColorDrawable
  // 是原生先有的，第一次读才有包装
  const drawableProp = (name, setter, getter) => [
    function () { return own(this, name, nativeCallObject(this, getter, [])); },
    function (v) {
      const d = drawableOrNull(v, name);
      nativeCall(this, setter, [d]);
      own(this, name, d);
    },
  ];

  addAccessors(View.prototype, {
    background: drawableProp('background', 'setBackground', 'getBackground'),
    foreground: drawableProp('foreground', 'setForeground', 'getForeground'),
    alpha: numberProp('alpha'),
    visibility: enumProp('visibility'),
    elevation: numberProp('elevation'),
    translationZ: numberProp('translationZ'),
    // elevation + translationZ；写它改的是 translationZ
    z: numberProp('z'),
    translationX: numberProp('translationX'),
    translationY: numberProp('translationY'),
    scaleX: numberProp('scaleX'),
    scaleY: numberProp('scaleY'),
    rotation: numberProp('rotation'),
    rotationX: numberProp('rotationX'),
    rotationY: numberProp('rotationY'),
    pivotX: numberProp('pivotX'),
    pivotY: numberProp('pivotY'),
    isPivotSet: readOnly('isPivotSet'),
    cameraDistance: numberProp('cameraDistance'),
    outlineProvider: enumProp('outlineProvider'),
    clipToOutline: booleanProp('clipToOutline'),
    outlineAmbientShadowColor: colorProp('outlineAmbientShadowColor'),
    outlineSpotShadowColor: colorProp('outlineSpotShadowColor'),
  });

  addMethods(View.prototype, {
    // 背景换成一块纯色（系统建一个 ColorDrawable）
    setBackgroundColor(color) {
      requireArgs(arguments, 1, 'setBackgroundColor');
      nativeCall(this, 'setBackgroundColor', [colorArgument('setBackgroundColor', color)]);
      own(this, 'background', null);
    },
    resetPivot() {
      nativeCall(this, 'resetPivot', []);
    },
  });

  // ---- RenderEffect：Android 12 起 ----

  if (nativeClassCallValue('@appearance', 'hasRenderEffect', []) === true) {
    const kFactory = Symbol('RenderEffect');

    class RenderEffect {
      constructor(token) {
        if (token !== kFactory) {
          throw new TypeError('Illegal constructor: use RenderEffect.createBlurEffect()');
        }
      }

      // 高斯模糊。半径是像素；edgeTreatment 是边缘外的像素怎么取，默认 'clamp'（照 Compose 的 blur）
      static createBlurEffect(radiusX, radiusY, edgeTreatment = 'clamp') {
        requireArgs(arguments, 2, 'createBlurEffect');
        const args = ['blur', toNumber(radiusX, 'createBlurEffect'), toNumber(radiusY, 'createBlurEffect'),
                      toText(edgeTreatment)];
        const effect = new RenderEffect(kFactory);
        constructNative(effect, RenderEffect, 'RenderEffect', args);
        return effect;
      }
    }
    defineNativeClass('RenderEffect', RenderEffect);

    addMethods(View.prototype, {
      // 给视图加一个效果（模糊），null 去掉。Java 只有 setter，没有 getter。视图持有它
      setRenderEffect(effect) {
        requireArgs(arguments, 1, 'setRenderEffect');
        const e = effect == null ? null : requireInstance(effect, RenderEffect, 'setRenderEffect');
        nativeCall(this, 'setRenderEffect', [e]);
        own(this, 'renderEffect', e);
      },
    });
  }

  Object.assign(ctx, {
    Drawable,
    colorArgument,
    colorProperty,
    colorText,
    parseColor,
    toNumber,
  });
})
