// 字体和图片
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    INSETS_FIELDS,
    SIZE_FIELDS,
    defineNativeClass,
    has,
    nativeCallAsync,
    nativeCallObject,
    nativeClassCall,
    nativeGet,
    nativeOnly,
    structArg,
    toInsets,
    toNumber,
    toSize,
    toText,
  } = ctx;

  defineNativeClass('UIFont', class UIFont extends NSObject {
    constructor() { nativeOnly(new.target); }
    static systemFontOfSize(size, options) {
      const o = options || {};
      if (has(o, 'weight')) {
        return nativeClassCall('UIFont', 'systemFontOfSize:weight:',
                               [toNumber(size, 'size'), o.weight]);
      }
      return nativeClassCall('UIFont', 'systemFontOfSize:', [toNumber(size, 'size')]);
    }
    static boldSystemFontOfSize(size) {
      return nativeClassCall('UIFont', 'boldSystemFontOfSize:', [toNumber(size, 'size')]);
    }
    static italicSystemFontOfSize(size) {
      return nativeClassCall('UIFont', 'italicSystemFontOfSize:', [toNumber(size, 'size')]);
    }
    static monospacedSystemFontOfSize(size, options) {
      const o = options || {};
      return nativeClassCall('UIFont', 'monospacedSystemFontOfSize:weight:',
                             [toNumber(size, 'size'), has(o, 'weight') ? o.weight : 'regular']);
    }
    static monospacedDigitSystemFontOfSize(size, options) {
      const o = options || {};
      return nativeClassCall('UIFont', 'monospacedDigitSystemFontOfSize:weight:',
                             [toNumber(size, 'size'), has(o, 'weight') ? o.weight : 'regular']);
    }
    static fontWithName(name, options) {
      const o = options || {};
      if (!(has(o, 'size'))) throw new TypeError('fontWithName needs { size }');
      return nativeClassCall('UIFont', 'fontWithName:size:',
                             [toText(name), toNumber(o.size, 'size')]);
    }
    // 动态字体：跟随系统的「文字大小」设置
    static preferredFontForTextStyle(style) {
      return nativeClassCall('UIFont', 'preferredFontForTextStyle:', [style]);
    }
    get familyName() { return nativeGet(this, 'familyName'); }
    get fontName() { return nativeGet(this, 'fontName'); }
    get pointSize() { return nativeGet(this, 'pointSize'); }
    get ascender() { return nativeGet(this, 'ascender'); }
    get descender() { return nativeGet(this, 'descender'); }
    get capHeight() { return nativeGet(this, 'capHeight'); }
    get xHeight() { return nativeGet(this, 'xHeight'); }
    get lineHeight() { return nativeGet(this, 'lineHeight'); }
    get leading() { return nativeGet(this, 'leading'); }
  });

  // 图片。和 UIFont 一样走类方法，不能 new——四条取图路径都是工厂方法，
  // 而且都可能返回 null（名字不存在、文件读不到、字节解不出来），
  // 这是合法答案，不是错误。
  //
  // UIImage 是**不可变**的：改渲染模式、做九宫格都返回一张新图。
  defineNativeClass('UIImage', class UIImage extends NSObject {
    constructor() { nativeOnly(new.target); }

    // Asset Catalog 和 bundle 里的普通文件都能命中，认子目录路径
    // （'assets/logo' 可以，但不会递归搜）。@2x/@3x 由系统按屏幕自动选。
    static imageNamed(name) {
      return nativeClassCall('UIImage', 'imageNamed:', [toText(name)]);
    }
    // SF Symbols，上千个图标，不占包体积
    static systemImageNamed(name) {
      return nativeClassCall('UIImage', 'systemImageNamed:', [toText(name)]);
    }
    // 完整路径，只认真实文件，不碰 Asset Catalog
    static imageWithContentsOfFile(path) {
      return nativeClassCall('UIImage', 'imageWithContentsOfFile:', [toText(path)]);
    }
    // 吃 Blob：fetch 下来的字节直接变成图，全程不进 V8 堆
    static imageWithData(blob, options) {
      const o = options || {};
      if (has(o, 'scale')) {
        return nativeClassCall('UIImage', 'imageWithData:scale:',
                               [blob, toNumber(o.scale, 'scale')]);
      }
      return nativeClassCall('UIImage', 'imageWithData:', [blob]);
    }

    // size 是**点**不是像素。像素 = size × scale
    get size() { return toSize(nativeGet(this, 'size')); }
    get scale() { return nativeGet(this, 'scale'); }
    get imageOrientation() { return nativeGet(this, 'imageOrientation'); }
    get isSymbolImage() { return nativeGet(this, 'isSymbolImage'); }
    get renderingMode() { return nativeGet(this, 'renderingMode'); }
    get capInsets() { return toInsets(nativeGet(this, 'capInsets')); }
    get resizingMode() { return nativeGet(this, 'resizingMode'); }
    get alignmentRectInsets() {
      return toInsets(nativeGet(this, 'alignmentRectInsets'));
    }
    get duration() { return nativeGet(this, 'duration'); }

    // 九宫格：四条边不参与拉伸，只拉中间。小图铺大容器的正解——
    // 把图放大只会糊，这个不会。
    resizableImage(options) {
      const o = options || {};
      if (!(has(o, 'withCapInsets'))) {
        throw new TypeError('resizableImage needs { withCapInsets }');
      }
      const insets = structArg(o.withCapInsets, INSETS_FIELDS, 'withCapInsets');
      if (has(o, 'resizingMode')) {
        return nativeCallObject(this, 'resizableImageWithCapInsets:resizingMode:',
                                [insets, o.resizingMode]);
      }
      return nativeCallObject(this, 'resizableImageWithCapInsets:', [insets]);
    }
    imageWithRenderingMode(mode) {
      return nativeCallObject(this, 'imageWithRenderingMode:', [mode]);
    }

    // 解码默认发生在绘制时，也就是主线程。这两个把解码挪到后台，
    // 解完再给一张准备好的图。JS 本来就在主线程抢时间，大图要走这条。
    prepareForDisplay() {
      return nativeCallAsync(this, 'prepareForDisplay', []);
    }
    prepareThumbnail(size) {
      return nativeCallAsync(this, 'prepareThumbnailOfSize:',
                             [structArg(size, SIZE_FIELDS, 'prepareThumbnail')]);
    }
  });

  // 会接收触摸、并把触摸翻译成「控件事件」的视图。按钮、开关、滑块、
  // 输入框都是它的子类。
  //
  // 它是 iOS 四套事件机制里唯一**直接注册**的那套——不走 responder chain、
  // 不受手势抢占影响，所以最接近 addEventListener。另外三套（hit-testing、
  // responder chain、手势识别器）见 docs/internals/events.md。

})
