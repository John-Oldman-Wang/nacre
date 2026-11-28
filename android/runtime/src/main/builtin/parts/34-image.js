// 图片：AImageDecoder（读头、解码成 Bitmap 或 Drawable）、Bitmap、BitmapDrawable、
// AnimatedImageDrawable（动图）、ImageView。原生那一侧是 ImageDomain.kt 和 AnimatedImagePlace.kt。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 照「接类的总则」（2026-11-26，docs/project.md 第 4 节）：
//
// - 解码一律在后台做、返回 Promise（Java 的解码是同步的，主线程上解大图会卡）。来源直接给：Blob、
//   ArrayBuffer、typed array，或者项目 assets/ 里的路径。Java 解码时的回调（OnHeaderDecodedListener）
//   换成第二个参数里的设置。参数在 JS 里当场查，查出来的错和 Java 自己抛的异常都是 Promise 被拒。
// - Bitmap 是值对象：建出来就有原生对象，不分自由和挂上，任何页面都能用。尺寸是 px（像素数据的下标）。
// - BitmapDrawable 只在 JS 里记状态，每用在一个挂着的视图上按那个页面建一个原生对象（外观组的那一套，
//   见 30-appearance.js），密度按那个页面的。
// - 动图（AnimatedImageDrawable）只有解出来的那一个原生对象，和 Bitmap 一样是值对象。每用在一个视图上，
//   那一处是原生那边的一个薄 Drawable（AnimatedImagePlace），画的都是它：几个视图显示同一帧、一起播。
// - ImageView 的成员都是状态：读回写进去的值，长度是 dp。
// - 写错：Web IDL 转不过来的抛 TypeError，超出范围抛 RangeError，枚举名和颜色写错在属性位打警告、
//   值不变；用了回收掉的图、在放在显存里的图上读像素抛 InvalidStateError。
(function (ctx) {
  'use strict';

  const {
    Drawable,
    IGNORE,
    colorState,
    colorText,
    define,
    defineModel,
    defineModelSlot,
    defineModelState,
    defineNativeClass,
    defineViewState,
    describeValue,
    enumArgument,
    enumProperty,
    initModel,
    kHandle,
    kModel,
    kSubscribe,
    native,
    nativeCall,
    nativeCallAsync,
    nativeCallObject,
    nativeClassCallValue,
    nativeGet,
    nativeSet,
    parseColor,
    px,
    requireInstance,
    stateValue,
    subscribeNative,
    toInteger,
    toText,
  } = ctx;
  // 10-view.js、core 的 23-fetch.js 定义的，挂在全局
  const { View, Blob } = globalThis;

  // ---- 助手 ----

  const isObject = (v) => v !== null && (typeof v === 'object' || typeof v === 'function');

  function requireArgs(args, count, where) {
    if (args.length < count) {
      throw new TypeError(where + ': ' + count + ' argument' + (count > 1 ? 's' : '') + ' required, but only ' +
                          args.length + ' present.');
    }
  }
  function invalidState(message) {
    return new ctx.DOMException(message, 'InvalidStateError');
  }
  // 字典的成员：undefined 当没给，必填的没给抛 TypeError
  function required(dict, key, where) {
    const v = dict[key];
    if (v === undefined) throw new TypeError(where + ': required member ' + key + ' is undefined.');
    return v;
  }
  function dictionary(v, where) {
    if (!isObject(v)) throw new TypeError(where + ': expected an object, got ' + describeValue(v));
    return v;
  }
  function toNumber(v, where) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(where + ': expected a finite number, got ' + describeValue(v));
    return n;
  }
  // 整数：大于 0、不小于 0
  function positiveInteger(v, where) {
    const n = toInteger(v, where);
    if (n <= 0) throw new RangeError(where + ': expected an integer greater than 0, got ' + n);
    return n;
  }
  function nonNegativeInteger(v, where) {
    const n = toInteger(v, where);
    if (n < 0) throw new RangeError(where + ': expected an integer not less than 0, got ' + n);
    return n;
  }
  function nonNegative(v, where) {
    const n = toNumber(v, where);
    if (n < 0) throw new RangeError(where + ': expected a number not less than 0, got ' + n);
    return n;
  }
  function unit(v, where) {
    const n = toNumber(v, where);
    if (n < 0 || n > 1) throw new RangeError(where + ': expected a number between 0 and 1, got ' + n);
    return n;
  }
  // 返回 Promise 的方法：参数查出来的错也是 Promise 被拒（照 Web IDL）
  function promised(fn) {
    try {
      return fn();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // 只有运行时自己能建的东西，构造函数认这个记号
  const kFactory = Symbol('image');

  // ---- AImageDecoder ----
  //
  // Java 的 ImageDecoder。WebCodecs 也有一个 ImageDecoder，名字撞了，照规矩前面加 A（2026-11-28）

  // 图从哪来：路径（项目 assets/ 里的）、Blob、ArrayBuffer、typed array（拷成一个 Blob）。
  // 每次解码在原生那边建一个来源（Java 的 ImageDecoder.Source），用完就扔，不交给 JS
  function sourceOf(input, where) {
    let path = null;
    let blob = null;
    if (typeof input === 'string') {
      path = input;
    } else if (input instanceof Blob && input[kHandle] !== undefined) {
      blob = input;
    } else if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
      blob = new Blob([input]);
    } else {
      throw new TypeError(where + ': expected a Blob, an ArrayBuffer, a typed array or a path in assets/, got ' +
                          describeValue(input));
    }
    const source = Object.create(null);
    const handle = native.construct('@imageSource', [path], [blob === null ? 0 : blob[kHandle]], source);
    if (!handle) throw new TypeError(where + ': cannot read the image');
    Object.defineProperty(source, kHandle, { value: handle });
    return source;
  }

  // 解码时的设置，照 Web IDL 的字典转：null / undefined 是空的，成员是 undefined 当没给。
  // 尺寸都是 px。互相冲突的组合当场拒（Java 到解码时才抛 IllegalStateException）
  function settingsOf(options, where, drawable) {
    if (options == null) return {};
    if (!isObject(options)) throw new TypeError(where + ": parameter 2 is not of type 'object'.");
    const out = {};
    if (options.targetSize !== undefined) {
      const s = dictionary(options.targetSize, where + ': targetSize');
      out.targetSize = [positiveInteger(required(s, 'width', where + ': targetSize'), where + ': targetSize.width'),
                        positiveInteger(required(s, 'height', where + ': targetSize'), where + ': targetSize.height')];
    }
    if (options.targetSampleSize !== undefined) {
      if (out.targetSize !== undefined) {
        throw new TypeError(where + ': targetSize and targetSampleSize cannot both be given');
      }
      out.targetSampleSize = positiveInteger(options.targetSampleSize, where + ': targetSampleSize');
    }
    if (options.crop !== undefined) {
      const c = dictionary(options.crop, where + ': crop');
      const at = where + ': crop';
      out.crop = [
        nonNegativeInteger(required(c, 'x', at), at + '.x'),
        nonNegativeInteger(required(c, 'y', at), at + '.y'),
        positiveInteger(required(c, 'width', at), at + '.width'),
        positiveInteger(required(c, 'height', at), at + '.height'),
      ];
    }
    if (options.allocator !== undefined) out.allocator = enumArgument('imageAllocator', options.allocator, 'allocator');
    if (options.memorySizePolicy !== undefined) {
      out.memorySizePolicy = enumArgument('imageMemoryPolicy', options.memorySizePolicy, 'memorySizePolicy');
    }
    for (const key of ['mutableRequired', 'unpremultipliedRequired', 'decodeAsAlphaMaskEnabled']) {
      if (options[key] !== undefined) out[key] = Boolean(options[key]);
    }
    if (out.allocator === 'hardware' && out.mutableRequired === true) {
      throw new TypeError(where + ": a bitmap with allocator 'hardware' cannot be mutable");
    }
    if (out.allocator === 'hardware' && out.decodeAsAlphaMaskEnabled === true) {
      throw new TypeError(where + ": a bitmap with allocator 'hardware' cannot be an alpha mask");
    }
    if (drawable && out.mutableRequired === true) {
      throw new TypeError(where + ': a drawable cannot be decoded as mutable; use decodeBitmap()');
    }
    return out;
  }

  class AImageDecoder {
    constructor() {
      throw new TypeError('Illegal constructor: AImageDecoder cannot be constructed; ' +
                          'use AImageDecoder.decodeBitmap() or AImageDecoder.decodeDrawable()');
    }

    // 只读图的开头：宽高（px）、类型、是不是动图。不解像素
    static decodeHeader(input) {
      const where = "Failed to execute 'decodeHeader' on 'AImageDecoder'";
      return promised(() => {
        requireArgs(arguments, 1, where);
        return nativeCallAsync(sourceOf(input, where), 'decodeHeader', []).then((raw) => new ImageInfo(kFactory, raw));
      });
    }

    // 解成一张 Bitmap（动图是第一帧）
    static decodeBitmap(input, options) {
      const where = "Failed to execute 'decodeBitmap' on 'AImageDecoder'";
      return promised(() => {
        requireArgs(arguments, 1, where);
        const settings = settingsOf(options, where, false);
        return nativeCallAsync(sourceOf(input, where), 'decodeBitmap', [settings]);
      });
    }

    // 解成一个 Drawable：动图是 AnimatedImageDrawable，别的是拿着解出来那张图的 BitmapDrawable
    static decodeDrawable(input, options) {
      const where = "Failed to execute 'decodeDrawable' on 'AImageDecoder'";
      return promised(() => {
        requireArgs(arguments, 1, where);
        const settings = settingsOf(options, where, true);
        return nativeCallAsync(sourceOf(input, where), 'decodeDrawable', [settings]).then((result) => {
          if (result instanceof Bitmap) return new BitmapDrawable(result);
          // 动图的包装是原生先有、引擎建的（不走构造函数），在这里补上 Drawable 的记录
          if (result[kModel] === undefined) initModel(result);
          return result;
        });
      });
    }

    static isMimeTypeSupported(mimeType) {
      requireArgs(arguments, 1, "Failed to execute 'isMimeTypeSupported' on 'AImageDecoder'");
      return nativeClassCallValue('AImageDecoder', 'isMimeTypeSupported', [toText(mimeType)]);
    }
  }
  define(globalThis, 'AImageDecoder', AImageDecoder);

  // decodeHeader 的结果：一份快照，字段只读
  class ImageInfo {
    #size;
    #mimeType;
    #isAnimated;

    constructor(token, raw) {
      if (token !== kFactory) {
        throw new TypeError('Illegal constructor: AImageDecoder.ImageInfo is created by AImageDecoder.decodeHeader()');
      }
      this.#size = Object.freeze({ width: raw.width, height: raw.height });
      this.#mimeType = raw.mimeType;
      this.#isAnimated = raw.isAnimated;
    }

    // { width, height }，px
    get size() { return this.#size; }
    get mimeType() { return this.#mimeType; }
    get isAnimated() { return this.#isAnimated; }
  }
  define(AImageDecoder, 'ImageInfo', ImageInfo);

  // ---- Bitmap：值对象 ----

  // 哪些 BitmapDrawable 拿着这张图（弱引用：BitmapDrawable 没人用了就回收掉）。recycle 时用来查
  // 「有没有挂着的视图在用」
  const holders = new WeakMap();  // Bitmap -> Set<WeakRef<BitmapDrawable>>

  function hold(bitmap, d) {
    if (bitmap === null) return;
    let set = holders.get(bitmap);
    if (set === undefined) holders.set(bitmap, (set = new Set()));
    set.add(new WeakRef(d));
  }

  // 有没有一个挂着的视图在用它：拿着它的 BitmapDrawable 现在有一处（只有挂着的视图上才有）
  function displayed(bitmap) {
    const set = holders.get(bitmap);
    if (set === undefined) return false;
    let found = false;
    for (const ref of [...set]) {
      const d = ref.deref();
      if (d === undefined || stateValue(d, 'bitmap') !== bitmap) {
        set.delete(ref);
        continue;
      }
      if (d[kModel].places.size > 0) found = true;
    }
    return found;
  }

  function infoOf(bitmap) {
    return nativeGet(bitmap, '@info');
  }
  function requireUsable(bitmap, where) {
    if (infoOf(bitmap).isRecycled) throw invalidState(where + ': the bitmap has been recycled');
  }
  function requireBitmap(v, where) {
    return requireInstance(v, Bitmap, where);
  }
  // 可空的 Bitmap 参数：要是没回收的
  function bitmapOrNull(v, where) {
    if (v == null) return null;
    requireBitmap(v, where);
    requireUsable(v, where);
    return v;
  }

  class Bitmap {
    constructor() {
      throw new TypeError('Illegal constructor: Bitmap is created by AImageDecoder.decodeBitmap(), ' +
                          'Bitmap.createScaledBitmap() or Bitmap.createBitmap()');
    }

    // 读一个像素，颜色字符串。坐标是 px
    getPixel(x, y) {
      const where = "Failed to execute 'getPixel' on 'Bitmap'";
      requireArgs(arguments, 2, where);
      const px = toInteger(x, where);
      const py = toInteger(y, where);
      const info = infoOf(this);
      if (info.isRecycled) throw invalidState(where + ': the bitmap has been recycled');
      if (info.config === 'hardware') {
        throw invalidState(where + ": the pixels of a bitmap with config 'hardware' are not readable");
      }
      if (px < 0 || px >= info.width || py < 0 || py >= info.height) {
        throw new RangeError(where + ': (' + px + ', ' + py + ') is outside the bitmap (' + info.width + ' × ' +
                             info.height + ')');
      }
      return colorText(nativeCall(this, 'getPixel', [px, py]));
    }

    // 马上放掉像素占的内存。还有挂着的视图在用就拒绝（Java 不拒，系统画它时整个 App 崩）。
    // 回收过再调什么都不做
    recycle() {
      if (displayed(this)) {
        throw invalidState("Failed to execute 'recycle' on 'Bitmap': the bitmap is displayed by a view " +
                           'that is attached to an activity');
      }
      nativeCall(this, 'recycle', []);
    }

    // 缩放成一张新图。filter 是缩放时要不要插值，默认 true。不可改的图、大小不变时 Java 把原图原样还回来
    static createScaledBitmap(src, options) {
      const where = "Failed to execute 'createScaledBitmap' on 'Bitmap'";
      requireArgs(arguments, 2, where);
      requireBitmap(src, where);
      if (!isObject(options)) throw new TypeError(where + ": parameter 2 is not of type 'object'.");
      const width = positiveInteger(required(options, 'width', where), where + ': width');
      const height = positiveInteger(required(options, 'height', where), where + ': height');
      const filter = options.filter === undefined ? true : Boolean(options.filter);
      requireUsable(src, where);
      return nativeCallObject(src, 'createScaledBitmap', [width, height, filter]);
    }

    // 从原图里裁一块，px
    static createBitmap(src, options) {
      const where = "Failed to execute 'createBitmap' on 'Bitmap'";
      requireArgs(arguments, 2, where);
      requireBitmap(src, where);
      if (!isObject(options)) throw new TypeError(where + ": parameter 2 is not of type 'object'.");
      const x = nonNegativeInteger(required(options, 'x', where), where + ': x');
      const y = nonNegativeInteger(required(options, 'y', where), where + ': y');
      const width = positiveInteger(required(options, 'width', where), where + ': width');
      const height = positiveInteger(required(options, 'height', where), where + ': height');
      const info = infoOf(src);
      if (info.isRecycled) throw invalidState(where + ': the bitmap has been recycled');
      if (x + width > info.width || y + height > info.height) {
        throw new RangeError(where + ': the area (' + x + ', ' + y + ', ' + width + ' × ' + height +
                             ') is outside the bitmap (' + info.width + ' × ' + info.height + ')');
      }
      return nativeCallObject(src, 'createBitmap', [x, y, width, height]);
    }
  }
  // 只读的：都是这张图自己的事实，读原生
  for (const name of ['width', 'height', 'config', 'byteCount', 'allocationByteCount', 'isMutable',
                      'isPremultiplied', 'hasAlpha', 'isRecycled']) {
    Object.defineProperty(Bitmap.prototype, name, {
      get() { return nativeGet(this, name); },
      enumerable: false,
      configurable: true,
    });
  }
  // 每英寸多少像素：BitmapDrawable 按它和页面的密度换算图在屏幕上多大。null 是没设
  // （一个像素就是屏幕上的一个像素）
  Object.defineProperty(Bitmap.prototype, 'density', {
    get() { return nativeGet(this, 'density'); },
    set(v) { nativeSet(this, 'density', v == null ? null : positiveInteger(v, 'density')); },
    enumerable: false,
    configurable: true,
  });
  defineNativeClass('Bitmap', Bitmap);

  // ---- BitmapDrawable：只在 JS 里记状态 ----

  class BitmapDrawable extends Drawable {
    // bitmap 可以是 null（什么都不画）
    constructor(bitmap) {
      const where = "Failed to construct 'BitmapDrawable'";
      requireArgs(arguments, 1, where);
      const b = bitmapOrNull(bitmap, where);
      super();
      this[kModel].values.set('bitmap', b);
      hold(b, this);
    }
  }
  defineNativeClass('BitmapDrawable', BitmapDrawable);
  // 每一处按那个页面的密度（dpi）换算图的大小：160 dpi 的图一个像素是 1 dp
  defineModel(BitmapDrawable, {
    nativeClass: 'BitmapDrawable',
    construct: (d, page) => [stateValue(d, 'bitmap'), Math.round(page.density * 160)],
  });
  // 图：构造时给，也能换（Java 的 setBitmap 是 Android 12 起才有，这里换了就重建那一处，11 上也能用）
  defineModelState(BitmapDrawable, 'bitmap', {
    order: 100,
    initial: null,
    convert: (v, what) => bitmapOrNull(v, what),
    after: (d, value) => hold(value, d),
    apply: () => {},  // 是构造参数
    rebuild: () => true,
  });
  // 平铺：'clamp' | 'repeat' | 'mirror' | 'decal'（Android 12 起）；null 是不平铺
  for (const [name, order] of [['tileModeX', 110], ['tileModeY', 111]]) {
    defineModelState(BitmapDrawable, name, {
      order,
      initial: null,
      convert: (v, what) => (v == null ? null : enumProperty('bitmapTileMode', v, what)),
      apply: (standIn, value) => nativeSet(standIn, name, value),
    });
  }
  // 缩放时插不插值
  defineModelState(BitmapDrawable, 'isFilterBitmap', {
    order: 120,
    initial: true,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, 'isFilterBitmap', value),
  });

  // ---- AnimatedImageDrawable：值对象，只有解出来的那一个原生对象 ----

  const animationEvents = new Set(['animationstart', 'animationend']);

  class AnimatedImageDrawable extends Drawable {
    constructor() {
      throw new TypeError('Illegal constructor: AnimatedImageDrawable is created by AImageDecoder.decodeDrawable()');
    }

    // 播完一遍之后再重复几遍；'infinite' 是一直播。默认照文件里写的
    get repeatCount() { return nativeGet(this, 'repeatCount'); }
    set repeatCount(v) {
      if (typeof v === 'string') {
        const name = enumProperty('repeatCount', v, 'repeatCount');
        if (name !== IGNORE) nativeSet(this, 'repeatCount', name);
        return;
      }
      nativeSet(this, 'repeatCount', nonNegativeInteger(v, 'repeatCount'));
    }

    get isRunning() { return nativeGet(this, 'isRunning'); }

    // 开始播、停下。没用在视图上也能调；系统画到它时才真的动
    start() { nativeCall(this, 'start', []); }
    stop() { nativeCall(this, 'stop', []); }

    [kSubscribe](type, on) {
      if (animationEvents.has(type)) subscribeNative(this, type, on);
    }
  }
  defineNativeClass('AnimatedImageDrawable', AnimatedImageDrawable);
  // 每一处是原生那边的一个薄 Drawable，画的是这个动图（构造参数就是它）
  defineModel(AnimatedImageDrawable, {
    nativeClass: '@animatedImagePlace',
    construct: (d) => [d],
  });

  // ---- ImageView ----

  class ImageView extends View {}
  defineNativeClass('ImageView', ImageView);

  // 显示的 Drawable（BitmapDrawable、动图，或者别的 Drawable），null 是什么都不显示
  defineModelSlot(ImageView, 'drawable', {
    order: 600,
    Cls: Drawable,
    set: (standIn, d) => nativeCall(standIn, 'setImageDrawable', [d]),
  });
  // 按图的比例定自己的大小。Java 的 setAdjustViewBounds(true) 会把 scaleType 改成 fitCenter（实测），
  // 所以设完再按 JS 的把 scaleType 设回去
  defineViewState(ImageView, 'adjustViewBounds', {
    order: 610,
    initial: false,
    convert: (v) => Boolean(v),
    apply: (standIn, value, page, view) => {
      nativeSet(standIn, 'adjustViewBounds', value);
      nativeSet(standIn, 'scaleType', view.scaleType);
    },
  });
  defineViewState(ImageView, 'scaleType', {
    order: 611,
    initial: 'fitCenter',
    convert: (v, what) => enumProperty('scaleType', v, what),
    apply: (standIn, value) => nativeSet(standIn, 'scaleType', value),
  });
  // 最大宽高，dp；null 是不限。只在 adjustViewBounds 时起作用（和 Java 一样）
  for (const [name, order] of [['maxWidth', 620], ['maxHeight', 621]]) {
    defineViewState(ImageView, name, {
      order,
      initial: null,
      units: 'dp',
      convert: (v, what) => (v == null ? null : nonNegative(v, what)),
      apply: (standIn, value, page) => nativeSet(standIn, name, value === null ? null : px(page, value)),
    });
  }
  // 图的透明度，0–1（Java 是 0–255）
  defineViewState(ImageView, 'imageAlpha', {
    order: 630,
    initial: 1,
    convert: (v, what) => unit(v, what),
    apply: (standIn, value) => nativeSet(standIn, 'imageAlpha', Math.round(value * 255)),
  });
  defineViewState(ImageView, 'cropToPadding', {
    order: 640,
    initial: false,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, 'cropToPadding', value),
  });
  // 给图着色：null，或者 { color, mode }。mode 是混合模式（PorterDuff.Mode 转驼峰），不写是 'srcAtop'
  // （和 Java 一个参数的 setColorFilter 一样）。读出冻结的副本，mode 补上
  defineViewState(ImageView, 'colorFilter', {
    order: 650,
    initial: null,
    convert: (v, what) => {
      if (v == null) return null;
      if (!isObject(v)) throw new TypeError(what + ': expected an object { color, mode } or null, got ' + describeValue(v));
      const color = colorState(required(v, 'color', what), what);
      if (color === IGNORE) return IGNORE;
      const mode = v.mode === undefined ? 'srcAtop' : enumProperty('porterDuffMode', v.mode, what + '.mode');
      if (mode === IGNORE) return IGNORE;
      return Object.freeze({ color, mode });
    },
    apply: (standIn, value) => nativeCall(standIn, '@colorFilter',
                                          value === null ? [null, null] : [parseColor(value.color), value.mode]),
  });
})
