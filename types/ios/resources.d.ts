// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 颜色、字体、图片。三个都是不可变的值类对象，派生方法返回新对象。

// ---------------------------------------------------------------------------
// 颜色
// ---------------------------------------------------------------------------

/**
 * 颜色。不能直接构造，只能从类级属性取。
 *
 * 不可变：属性全 readonly，派生方法返回新对象，所以读出来的对象不用防御性
 * 复制。但不可变不等于定值——语义色持有的是一个 UITraitCollection → UIColor
 * 的函数，绘制时才求值，所以同一个 UIColor 画在不同视图上可以是不同颜色。
 *
 * 同一个常量每次取到的是同一个 JS 对象（UIColor.labelColor === UIColor.labelColor）。
 */
/**
 * 颜色写进去的形式。读出来永远是 `string`。
 *
 * - `'#f00'` / `'#ff0000'` / `'#ff000080'` / `'#f00a'`
 * - `'rgb(255, 0, 0)'` / `'rgb(255 0 0)'` / `'rgba(255,0,0,.5)'` / `'rgb(255 0 0 / 50%)'`
 * - `'light-dark(#fff, #000)'` —— 跟随深浅色
 * - `'systemBackground'` —— 语义色，就是 `UIColor` 上那 39 个常量去掉 `Color` 后缀
 * - `'asset(BrandBlue)'` —— Asset Catalog 里配好的色（支持高对比度等多维）
 * - `'native(7)'` —— 读出来时给的代号，表示这个颜色写不成通用语法。赋回去有效
 * - `UIColor` 对象 —— 底层的逃生口
 *
 * **不合法不抛**，打一条警告并保留旧值。
 */
type ColorValue = string | UIColor;

declare class UIColor extends NSObject {
  private constructor();

  // UIColor.h：基础色。固定 RGB，不随外观变化
  static readonly blackColor: UIColor;
  static readonly darkGrayColor: UIColor;
  static readonly lightGrayColor: UIColor;
  static readonly whiteColor: UIColor;
  static readonly grayColor: UIColor;
  static readonly redColor: UIColor;
  static readonly greenColor: UIColor;
  static readonly blueColor: UIColor;
  static readonly cyanColor: UIColor;
  static readonly yellowColor: UIColor;
  static readonly magentaColor: UIColor;
  static readonly orangeColor: UIColor;
  static readonly purpleColor: UIColor;
  static readonly brownColor: UIColor;
  static readonly clearColor: UIColor;

  // UIInterface.h：系统色。Apple 调校过的品牌色，深色模式下换一组值
  static readonly systemRedColor: UIColor;
  static readonly systemGreenColor: UIColor;
  static readonly systemBlueColor: UIColor;
  static readonly systemOrangeColor: UIColor;
  static readonly systemYellowColor: UIColor;
  static readonly systemPinkColor: UIColor;
  static readonly systemPurpleColor: UIColor;
  static readonly systemTealColor: UIColor;
  static readonly systemIndigoColor: UIColor;
  static readonly systemBrownColor: UIColor;
  static readonly systemMintColor: UIColor;
  static readonly systemCyanColor: UIColor;
  static readonly systemGrayColor: UIColor;

  // UIInterface.h：语义色。按用途命名，绘制时按当时的外观解析
  static readonly labelColor: UIColor;
  static readonly secondaryLabelColor: UIColor;
  static readonly tertiaryLabelColor: UIColor;
  static readonly quaternaryLabelColor: UIColor;
  static readonly placeholderTextColor: UIColor;
  static readonly separatorColor: UIColor;
  static readonly opaqueSeparatorColor: UIColor;
  static readonly linkColor: UIColor;
  static readonly systemBackgroundColor: UIColor;
  static readonly secondarySystemBackgroundColor: UIColor;
  static readonly tertiarySystemBackgroundColor: UIColor;
}

// ---------------------------------------------------------------------------
// 字体
// ---------------------------------------------------------------------------

/** 字体。不能直接构造，走类方法。 */
declare class UIFont extends NSObject {
  private constructor();

  static systemFontOfSize(size: number, options?: { weight?: UIFontWeight }): UIFont;
  static boldSystemFontOfSize(size: number): UIFont;
  static italicSystemFontOfSize(size: number): UIFont;
  static monospacedSystemFontOfSize(
    size: number,
    options?: { weight?: UIFontWeight },
  ): UIFont;
  static monospacedDigitSystemFontOfSize(
    size: number,
    options?: { weight?: UIFontWeight },
  ): UIFont;
  /** 系统里没有这个字体名时返回 null——这是合法答案，不是错误。 */
  static fontWithName(name: string, options: { size: number }): UIFont | null;
  /** 动态字体：跟随系统的「文字大小」设置。 */
  static preferredFontForTextStyle(style: UIFontTextStyle): UIFont;

  readonly familyName: string;
  /** 具体字体名，比如 '.SFUI-Bold'。 */
  readonly fontName: string;
  readonly pointSize: number;
  readonly ascender: number;
  readonly descender: number;
  readonly capHeight: number;
  readonly xHeight: number;
  readonly lineHeight: number;
  readonly leading: number;
}

// ---------------------------------------------------------------------------
// 图片
// ---------------------------------------------------------------------------

/**
 * 图片。不能直接构造，走类方法——四条取图路径都是工厂方法。
 *
 * **每一条都可能返回 null**：名字不存在、文件读不到、字节解不出来，这是
 * 合法答案而不是错误。
 *
 * `UIImage` 是不可变的：改渲染模式、做九宫格都返回一张新图。
 */
declare class UIImage extends NSObject {
  private constructor();

  /**
   * Asset Catalog 和 bundle 里的普通文件都能命中，认子目录路径
   * （`'assets/logo'` 可以，但不会递归搜）。`@2x` / `@3x` 由系统按屏幕自动选。
   *
   * 注意：进了 Asset Catalog 的图编译后就没有「文件」了，只能用这个名字取，
   * `imageWithContentsOfFile` 读不到，字节也拿不出来。
   */
  static imageNamed(name: string): UIImage | null;
  /** SF Symbols，上千个图标，不占包体积。 */
  static systemImageNamed(name: string): UIImage | null;
  /** 完整路径，只认真实文件，不碰 Asset Catalog。 */
  static imageWithContentsOfFile(path: string): UIImage | null;
  /** 吃 Blob：fetch 下来的字节直接变成图，全程不进 V8 堆。 */
  static imageWithData(blob: Blob, options?: { scale?: number }): UIImage | null;

  /** **点**，不是像素。像素 = `size` × `scale`。 */
  readonly size: CGSize;
  readonly scale: number;
  readonly imageOrientation: UIImageOrientation;
  readonly isSymbolImage: boolean;
  readonly renderingMode: UIImageRenderingMode;
  /** 九宫格里四条不参与拉伸的边；普通图片全是 0。 */
  readonly capInsets: UIEdgeInsets;
  readonly resizingMode: UIImageResizingMode;
  readonly alignmentRectInsets: UIEdgeInsets;
  /** 逐帧动画的一轮时长；静态图是 0。 */
  readonly duration: number;

  /**
   * 九宫格：四条边不参与拉伸，只拉中间。**小图铺大容器的正解**——
   * 把图整个放大只会糊，这个不会。
   */
  resizableImage(options: {
    withCapInsets: UIEdgeInsetsLike;
    resizingMode?: UIImageResizingMode;
  }): UIImage;
  imageWithRenderingMode(mode: UIImageRenderingMode): UIImage;

  /**
   * 解码默认发生在**绘制时**，也就是主线程。这两个把解码挪到后台，
   * 解完再给一张准备好的图。JS 本来就在主线程抢时间，大图要走这条。
   */
  prepareForDisplay(): Promise<UIImage | null>;
  prepareThumbnail(size: CGSizeLike): Promise<UIImage | null>;
}
