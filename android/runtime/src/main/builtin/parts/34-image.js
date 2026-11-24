// 图片：ImageDecoder（来源、读头、解码成 Bitmap 或 Drawable）、Bitmap、BitmapDrawable、
// AnimatedImageDrawable（动图）、ImageView。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 解码一律在后台做、返回 Promise（Java 的 decodeBitmap 是同步的，主线程上解大图会卡）。
// Java 解码时用一个回调（OnHeaderDecodedListener）设置怎么解，JS 不实现 Java 的接口，所以
// 换成第二个参数里的一个对象，键名是那些 set… 去掉 set；要先知道图多大再定怎么解，用
// decodeHeader（Java 里没有，补的）。不接 BitmapFactory：它能做的 ImageDecoder 都能做。
//
// 原生那一侧是 android/runtime 的 ImageDomain.kt。单位是像素。
(function (ctx) {
  'use strict';

  const {
    Drawable,
    colorArgument,
    colorText,
    constructNative,
    define,
    defineNativeClass,
    describeValue,
    kHandle,
    kSubscribe,
    nativeCall,
    nativeCallAsync,
    nativeCallObject,
    nativeClassCallValue,
    nativeGet,
    nativeSet,
    own,
    requireInstance,
    subscribeNative,
    toInteger,
    toText,
  } = ctx;
  // 10-view.js、core 的 23-fetch.js 定义的，挂在全局
  const { View, Blob } = globalThis;

  // ---- 助手 ----

  function requireArgs(args, count, what) {
    if (args.length < count) {
      throw new TypeError("Failed to execute '" + what + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + args.length + ' present.');
    }
  }
  // 往类上加成员：访问器 { name: [get, set] }，方法 { name: fn }。照 class 语法的样子，不可枚举
  function addAccessors(proto, accessors) {
    for (const [name, [get, set]] of Object.entries(accessors)) {
      Object.defineProperty(proto, name, { get, set, enumerable: false, configurable: true });
    }
  }
  const readOnly = (name) => [function () { return nativeGet(this, name); }, undefined];
  const integerProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toInteger(v, name)); },
  ];
  const booleanProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, Boolean(v)); },
  ];
  const enumProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toText(v)); },
  ];
  // 可空的整数：null 是「没设 / 不限」
  const nullableIntegerProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, v === null ? null : toInteger(v, name)); },
  ];
  // 可空的枚举：null 是「没有」
  const nullableEnumProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, v === null ? null : toText(v)); },
  ];

  // 嵌套的类（ImageDecoder.Source）：defineNativeClass 会把它挂到全局（名字带点），摘掉再挂成
  // 静态成员。和布局组的 ViewGroup.LayoutParams 一样
  function defineNested(Outer, name, cls) {
    const full = Outer.name + '.' + name;
    defineNativeClass(full, cls);
    delete globalThis[full];
    define(Outer, name, cls);
  }

  // 只有运行时自己能建的东西，构造函数认这个记号
  const kFactory = Symbol('image');

  // ---- ImageDecoder ----

  class ImageDecoder {
    constructor() {
      throw new TypeError('Illegal constructor: ImageDecoder cannot be constructed; ' +
                          'use ImageDecoder.createSource() and ImageDecoder.decodeBitmap()');
    }

    // 图从哪来：Blob、ArrayBuffer、typed array（拷成一个 Blob），或者项目 assets/ 里的路径。
    // 同一个来源可以解很多次。路径到解码时才打开，所以文件不存在是解码时被拒
    static createSource(input) {
      requireArgs(arguments, 1, 'createSource');
      let arg;
      if (typeof input === 'string') {
        arg = input;
      } else if (input instanceof Blob && input[kHandle] !== undefined) {
        arg = input;
      } else if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
        arg = new Blob([input]);
      } else {
        throw new TypeError("Failed to execute 'createSource': expected a Blob, an ArrayBuffer, a typed array " +
                            'or a path in assets/, got ' + describeValue(input));
      }
      const source = new Source(kFactory);
      constructNative(source, Source, 'ImageDecoder.Source', [arg]);
      return source;
    }

    // 只读图的开头：宽高、类型、是不是动图。不解像素
    static decodeHeader(source) {
      try {
        requireArgs(arguments, 1, 'decodeHeader');
        requireInstance(source, Source, 'decodeHeader');
        return nativeCallAsync(source, 'decodeHeader', []).then((raw) => new ImageInfo(kFactory, raw));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // 解成一张 Bitmap（动图是第一帧）
    static decodeBitmap(source, options) {
      return decode('decodeBitmap', arguments, source, options);
    }

    // 解成一个 Drawable：动图是 AnimatedImageDrawable，别的是 BitmapDrawable
    static decodeDrawable(source, options) {
      return decode('decodeDrawable', arguments, source, options);
    }

    static isMimeTypeSupported(mimeType) {
      requireArgs(arguments, 1, 'isMimeTypeSupported');
      return nativeClassCallValue('ImageDecoder', 'isMimeTypeSupported', [toText(mimeType)]);
    }
  }
  define(globalThis, 'ImageDecoder', ImageDecoder);

  function decode(name, args, source, options) {
    try {
      requireArgs(args, 1, name);
      requireInstance(source, Source, name);
      return nativeCallAsync(source, name, [settingsOf(options, name)]);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // 解码时的设置，照 Web IDL 的字典转：null / undefined 是空的，成员是 undefined 当没给。
  // 枚举的名字交给原生核对（写错是 TypeError，列出全部可选值）
  function settingsOf(options, where) {
    if (options == null) return {};
    if (typeof options !== 'object') {
      throw new TypeError(where + ': options must be an object, got ' + describeValue(options));
    }
    const out = {};
    const object = (key) => {
      const v = options[key];
      if (v === null || typeof v !== 'object') {
        throw new TypeError(where + ': ' + key + ' must be an object, got ' + describeValue(v));
      }
      return v;
    };
    const member = (obj, key, field) => {
      if (obj[field] === undefined) throw new TypeError(where + ': ' + key + '.' + field + ' is required');
      return toInteger(obj[field], where + ': ' + key + '.' + field);
    };
    if (options.targetSize !== undefined) {
      const s = object('targetSize');
      out.targetSize = [member(s, 'targetSize', 'width'), member(s, 'targetSize', 'height')];
    }
    if (options.targetSampleSize !== undefined) {
      out.targetSampleSize = toInteger(options.targetSampleSize, where + ': targetSampleSize');
    }
    if (options.crop !== undefined) {
      const c = object('crop');
      out.crop = ['left', 'top', 'right', 'bottom'].map((f) => member(c, 'crop', f));
    }
    for (const key of ['allocator', 'memorySizePolicy']) {
      if (options[key] !== undefined) out[key] = toText(options[key]);
    }
    for (const key of ['mutableRequired', 'unpremultipliedRequired', 'decodeAsAlphaMaskEnabled']) {
      if (options[key] !== undefined) out[key] = Boolean(options[key]);
    }
    return out;
  }

  // 来源。没有成员，只能交给 decode…
  class Source {
    constructor(token) {
      if (token !== kFactory) {
        throw new TypeError('Illegal constructor: use ImageDecoder.createSource()');
      }
    }
  }
  defineNested(ImageDecoder, 'Source', Source);

  // decodeHeader 的结果：一份快照，字段只读
  class ImageInfo {
    #size;
    #mimeType;
    #isAnimated;

    constructor(token, raw) {
      if (token !== kFactory) {
        throw new TypeError('Illegal constructor: ImageDecoder.ImageInfo is created by ImageDecoder.decodeHeader()');
      }
      this.#size = Object.freeze({ width: raw.width, height: raw.height });
      this.#mimeType = raw.mimeType;
      this.#isAnimated = raw.isAnimated;
    }

    // { width, height }，像素
    get size() { return this.#size; }
    get mimeType() { return this.#mimeType; }
    get isAnimated() { return this.#isAnimated; }
  }
  define(ImageDecoder, 'ImageInfo', ImageInfo);

  // ---- Bitmap ----

  class Bitmap {
    constructor() {
      throw new TypeError('Illegal constructor: Bitmap is created by ImageDecoder.decodeBitmap() ' +
                          'or Bitmap.createScaledBitmap() / Bitmap.createBitmap()');
    }

    // 读一个像素，颜色字符串。放在显存里的图（config 是 'hardware'）读不了
    getPixel(x, y) {
      requireArgs(arguments, 2, 'getPixel');
      return colorText(nativeCall(this, 'getPixel', [toInteger(x, 'getPixel'), toInteger(y, 'getPixel')]));
    }

    hasAlpha() {
      return nativeCall(this, 'hasAlpha', []);
    }

    // 马上放掉像素占的内存。之后还挂在视图上的话，系统画它时整个 App 会崩（和 Java 一样）
    recycle() {
      nativeCall(this, 'recycle', []);
    }

    // 缩放成一张新图（Java 可能把原图原样还回来）。filter 是缩放时要不要插值
    static createScaledBitmap(src, dstWidth, dstHeight, filter) {
      requireArgs(arguments, 4, 'createScaledBitmap');
      requireInstance(src, Bitmap, 'createScaledBitmap');
      return nativeCallObject(src, 'createScaledBitmap', [
        toInteger(dstWidth, 'createScaledBitmap'), toInteger(dstHeight, 'createScaledBitmap'), Boolean(filter)]);
    }

    // 从原图里裁一块。只接 createBitmap(source, x, y, width, height) 这一种重载
    static createBitmap(source, x, y, width, height) {
      if (arguments.length !== 5) {
        throw new TypeError("Failed to execute 'createBitmap': only createBitmap(source, x, y, width, height) " +
                            'is supported, got ' + arguments.length + ' arguments');
      }
      requireInstance(source, Bitmap, 'createBitmap');
      return nativeCallObject(source, 'createBitmap', [x, y, width, height].map((v) => toInteger(v, 'createBitmap')));
    }
  }
  addAccessors(Bitmap.prototype, {
    width: readOnly('width'),
    height: readOnly('height'),
    // 'argb8888'、'hardware'、'rgb565'……（Bitmap.Config 去掉下划线转驼峰）
    config: readOnly('config'),
    // 每英寸多少像素；null 是没设（DENSITY_NONE）
    density: nullableIntegerProp('density'),
    byteCount: readOnly('byteCount'),
    allocationByteCount: readOnly('allocationByteCount'),
    isMutable: readOnly('isMutable'),
    isPremultiplied: readOnly('isPremultiplied'),
    isRecycled: readOnly('isRecycled'),
  });
  defineNativeClass('Bitmap', Bitmap);

  // ---- BitmapDrawable ----

  class BitmapDrawable extends Drawable {
    // Java 的第一个参数 Resources 去掉了，用页面的。bitmap 可以是 null
    constructor(bitmap) {
      super();
      requireArgs(arguments, 1, 'BitmapDrawable');
      const b = bitmap == null ? null : requireInstance(bitmap, Bitmap, "Failed to construct 'BitmapDrawable'");
      constructNative(this, new.target, 'BitmapDrawable', [b]);
      own(this, 'bitmap', b);
    }

    get bitmap() {
      return own(this, 'bitmap', nativeCallObject(this, 'getBitmap', []));
    }

    setTileModeXY(x, y) {
      requireArgs(arguments, 2, 'setTileModeXY');
      nativeCall(this, 'setTileModeXY', [x == null ? null : toText(x), y == null ? null : toText(y)]);
    }
  }
  addAccessors(BitmapDrawable.prototype, {
    // 'clamp' | 'repeat' | 'mirror' | 'decal'（Android 12 起）；null 是不平铺
    tileModeX: nullableEnumProp('tileModeX'),
    tileModeY: nullableEnumProp('tileModeY'),
    isFilterBitmap: booleanProp('isFilterBitmap'),
  });
  defineNativeClass('BitmapDrawable', BitmapDrawable);

  // ---- AnimatedImageDrawable ----

  const animationEvents = new Set(['animationstart', 'animationend']);

  class AnimatedImageDrawable extends Drawable {
    constructor() {
      throw new TypeError('Illegal constructor: AnimatedImageDrawable is created by ImageDecoder.decodeDrawable()');
    }

    // 开始播。系统画到它时才真的动，所以要挂在屏幕上的视图里
    start() { nativeCall(this, 'start', []); }
    stop() { nativeCall(this, 'stop', []); }

    [kSubscribe](type, on) {
      if (animationEvents.has(type)) subscribeNative(this, type, on);
    }
  }
  addAccessors(AnimatedImageDrawable.prototype, {
    // 播完一遍之后再重复几遍；'infinite' 是一直播。默认照文件里写的
    repeatCount: [
      function () { return nativeGet(this, 'repeatCount'); },
      function (v) { nativeSet(this, 'repeatCount', typeof v === 'string' ? v : toInteger(v, 'repeatCount')); },
    ],
    isRunning: readOnly('isRunning'),
  });
  defineNativeClass('AnimatedImageDrawable', AnimatedImageDrawable);

  // ---- ImageView ----

  class ImageView extends View {
    constructor(context) {
      super(context);
      constructNative(this, new.target, 'ImageView', [context]);
    }

    // 视图拿着它显示的 Drawable（setImageBitmap 时是 ImageView 自己建的那个 BitmapDrawable）
    get drawable() {
      return own(this, 'image', nativeCallObject(this, 'getDrawable', []));
    }

    setImageBitmap(bitmap) {
      requireArgs(arguments, 1, 'setImageBitmap');
      const b = bitmap == null ? null : requireInstance(bitmap, Bitmap, 'setImageBitmap');
      nativeCall(this, 'setImageBitmap', [b]);
      // 系统建的（或者复用的）BitmapDrawable 拿着这张图；读 drawable 时再记那条边
      own(this, 'image', nativeCallObject(this, 'getDrawable', []));
    }

    setImageDrawable(drawable) {
      requireArgs(arguments, 1, 'setImageDrawable');
      const d = drawable == null ? null : requireInstance(drawable, Drawable, 'setImageDrawable');
      nativeCall(this, 'setImageDrawable', [d]);
      own(this, 'image', d);
    }

    // 给图着色：颜色加混合模式（PorterDuff.Mode 转驼峰，默认 'srcAtop'，和 Java 的一个参数的版本一样）
    setColorFilter(color, mode = 'srcAtop') {
      requireArgs(arguments, 1, 'setColorFilter');
      nativeCall(this, 'setColorFilter', [colorArgument('setColorFilter', color), toText(mode)]);
    }

    clearColorFilter() {
      nativeCall(this, 'clearColorFilter', []);
    }
  }
  addAccessors(ImageView.prototype, {
    scaleType: enumProp('scaleType'),
    adjustViewBounds: booleanProp('adjustViewBounds'),
    // 像素；null 是不限
    maxWidth: nullableIntegerProp('maxWidth'),
    maxHeight: nullableIntegerProp('maxHeight'),
    // 0–255
    imageAlpha: integerProp('imageAlpha'),
    cropToPadding: booleanProp('cropToPadding'),
  });
  defineNativeClass('ImageView', ImageView);
})
