// iOS 原生符号。按 ObjC 的类名裸暴露在全局，不设命名空间——ObjC 的类名
// 前缀（NS / UI / CA / CL…）已经承担了命名空间的职责，再套一层是双重前缀。
//
// 这一层的承诺是**能力对齐**，不是 API 形状一致：iOS 能做到的事 JS 也要能
// 做到，但怎么表达成 JS 是我们的自由。两条已定的规则：
//
//   方法名 = selector 第一段 + options 对象，键名就是 ObjC 的段名原文
//     insertSubview:atIndex:  →  view.insertSubview(box, { atIndex: 0 })
//
//   枚举 = 字符串，名字是 ObjC 常量去掉类型前缀、首字母小写
//     NSTextAlignmentCenter   →  'center'
//
// 一一对应的依据是 ios/Runtime/Builtin/nacre.js 和 ios/Runtime/NacreRuntime.mm，
// 改动时跑 ios/scripts/check-api.sh 核对。

// ---------------------------------------------------------------------------
// 枚举
// ---------------------------------------------------------------------------
//
// 写错了会抛 TypeError，错误信息里列着可选值。名字到数值的映射在原生层，
// 因为数值不稳定——NSTextAlignment 的值随 ABI 变（iOS 上 Center 是 1，
// macOS 上是 2），在 JS 里按下标映射换个平台就全错。

type NSTextAlignment = 'left' | 'center' | 'right' | 'justified' | 'natural';

type NSLineBreakMode =
  | 'byWordWrapping'
  | 'byCharWrapping'
  | 'byClipping'
  | 'byTruncatingHead'
  | 'byTruncatingTail'
  | 'byTruncatingMiddle';

type UIViewContentMode =
  | 'scaleToFill'
  | 'scaleAspectFit'
  | 'scaleAspectFill'
  | 'redraw'
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

type UIBaselineAdjustment = 'alignBaselines' | 'alignCenters' | 'none';

/** 图片的方向标记。相机常常横着存、靠这个转正，所以 size 已经反映了方向。 */
type UIImageOrientation =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'upMirrored'
  | 'downMirrored'
  | 'leftMirrored'
  | 'rightMirrored';

/** alwaysTemplate：忽略原图颜色，整张按 tintColor 上色。SF Symbols 默认如此。 */
type UIImageRenderingMode = 'automatic' | 'alwaysOriginal' | 'alwaysTemplate';

/** 九宫格中间那块怎么填。 */
type UIImageResizingMode = 'tile' | 'stretch';

/** ObjC 里是 CGFloat 常量不是枚举，JS 侧一视同仁用字符串。 */
type UIFontWeight =
  | 'ultraLight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';

/** ObjC 里是 NSString 常量。按字号从大到小排。 */
type UIFontTextStyle =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'subheadline'
  | 'body'
  | 'callout'
  | 'footnote'
  | 'caption1'
  | 'caption2';

type UISceneActivationState =
  | 'unattached'
  | 'foregroundActive'
  | 'foregroundInactive'
  | 'background'
  | 'unknown';

// ---------------------------------------------------------------------------
// 结构体
// ---------------------------------------------------------------------------
//
// 字段**只读**：ObjC 里 view.frame.x = 10 是编译错误（改的是返回的临时副本），
// 用可写对象表示会让它变成静默无效。这里写入直接抛 TypeError。
//
// 要改就整体赋一个新的：view.frame = new CGRect(0, 0, 100, 50)

declare class CGPoint {
  constructor(x: number, y: number);
  readonly x: number;
  readonly y: number;
}

declare class CGSize {
  constructor(width: number, height: number);
  readonly width: number;
  readonly height: number;
}

declare class CGRect {
  constructor(x: number, y: number, width: number, height: number);
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** 嵌套访问，和 ObjC 的 {CGPoint origin; CGSize size;} 对得上。 */
  readonly origin: CGPoint;
  readonly size: CGSize;
}

declare class UIEdgeInsets {
  constructor(top: number, left: number, bottom: number, right: number);
  readonly top: number;
  readonly left: number;
  readonly bottom: number;
  readonly right: number;
}

// 写入宽、读出窄：赋值时给个普通对象也行（字段齐就认，少一个会抛），
// 读出来永远是结构体类。所以 setter 收 Like、getter 给类本身。
type CGPointLike = CGPoint | { x: number; y: number };
type CGSizeLike = CGSize | { width: number; height: number };
type CGRectLike =
  | CGRect
  | { x: number; y: number; width: number; height: number };
type UIEdgeInsetsLike =
  | UIEdgeInsets
  | { top: number; left: number; bottom: number; right: number };

// ---------------------------------------------------------------------------
// 基础类
// ---------------------------------------------------------------------------

/**
 * ObjC 的根类，所以也是这里所有原生类的根。
 *
 * 它继承 EventTarget：原生对象要发事件是常态，抽到基类，不让每个类各自
 * 发明一套回调。
 */
declare class NSObject extends EventTarget {}

declare class UIResponder extends NSObject {}

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

// ---------------------------------------------------------------------------
// 场景
// ---------------------------------------------------------------------------

declare class UIScene extends UIResponder {
  /** protected 而不是 private：自己不可直接构造，但挡不住子类。 */
  protected constructor();
}

/** 场景的持久身份。场景对象会被系统销毁重建，session 活得更久。 */
declare class UISceneSession extends NSObject {
  private constructor();
  /** ObjC 常量原值，比如 'UIWindowSceneSessionRoleApplication'。 */
  readonly role: string;
  readonly persistentIdentifier: string;
  /** 自定义数据，系统会帮忙持久化。 */
  userInfo: Record<string, unknown> | null;
}

/** 场景上能监听的事件。 */
type UISceneEventType = 'active' | 'inactive' | 'foreground' | 'background';

/**
 * 已知事件名给补全，自定义的也接受——dispatchEvent 是公开 API，JS 可以派发
 * 自己的事件。`string & {}` 是让编辑器仍然提示已知值的惯用写法。
 */
type SceneEventName = UISceneEventType | (string & {});

declare class UIWindowScene extends UIScene {
  private constructor();
  /** 这个场景自己的前后台状态，和 application.state（所有场景的聚合）不是一回事。 */
  readonly activationState: UISceneActivationState;
  readonly session: UISceneSession;
  readonly isFullScreen: boolean;
  /** 多任务切换器的卡片上显示的标题。 */
  title: string | null;
  subtitle: string;
  /** 场景级的打开 URL。application.openURL 是 App 级的，两者都有。options 同样还没接。 */
  openURL(url: string): Promise<boolean>;

  addEventListener(
    type: SceneEventName,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
}

// ---------------------------------------------------------------------------
// 视图
// ---------------------------------------------------------------------------

declare class UIView extends UIResponder {
  constructor();

  // 几何。读 frame 每次都建一个新的 CGRect，字段只读；写入时给普通对象也行
  get frame(): CGRect;
  set frame(value: CGRectLike);
  get bounds(): CGRect;
  set bounds(value: CGRectLike);
  get center(): CGPoint;
  set center(value: CGPointLike);
  readonly safeAreaInsets: UIEdgeInsets;
  /**
   * 「我天生多大」。普通 UIView 返回 (-1, -1)，表示没有固有尺寸；
   * UILabel 按文字算。
   */
  readonly intrinsicContentSize: CGSize;

  // 层级
  readonly superview: UIView | null;
  readonly subviews: readonly UIView[];
  readonly window: UIWindow | null;

  // 外观
  backgroundColor: UIColor | null;
  /** 写 0.6 读回来是 0.6000000238418579——背后是 CALayer.opacity，32 位 float。 */
  alpha: number;
  isHidden: boolean;
  clipsToBounds: boolean;
  isOpaque: boolean;
  isUserInteractionEnabled: boolean;
  tag: number;
  contentMode: UIViewContentMode;

  /** 同步读布局。JS 跑在主线程，所以这件事天然成立。 */
  sizeThatFits(size: CGSizeLike): CGSize;
  sizeToFit(): void;
  convertPoint(point: CGPointLike, options: { toView: UIView | null }): CGPoint;
  convertPoint(point: CGPointLike, options: { fromView: UIView | null }): CGPoint;
  convertRect(rect: CGRectLike, options: { toView: UIView | null }): CGRect;
  convertRect(rect: CGRectLike, options: { fromView: UIView | null }): CGRect;
  /** 递归找这个点上的目标视图。没命中返回 null，是合法答案。 */
  hitTest(point: CGPointLike): UIView | null;

  addSubview(view: UIView): void;
  insertSubview(view: UIView, options: { atIndex: number }): void;
  insertSubview(view: UIView, options: { belowSubview: UIView }): void;
  insertSubview(view: UIView, options: { aboveSubview: UIView }): void;
  removeFromSuperview(): void;
  bringSubviewToFront(view: UIView): void;
  sendSubviewToBack(view: UIView): void;
  isDescendantOfView(view: UIView): boolean;
  viewWithTag(tag: number): UIView | null;

  setNeedsLayout(): void;
  layoutIfNeeded(): void;
  setNeedsDisplay(): void;
}

/** 窗口上能监听的事件。对应 isKeyWindow 和 isHidden 的变化。 */
type UIWindowEventType = 'becomekey' | 'resignkey' | 'becomevisible' | 'becomehidden';

type WindowEventName = UIWindowEventType | (string & {});

/**
 * 视图树的根，必须绑定到一个场景。
 *
 *   new UIWindow(scene)   参数齐全，立刻创建原生对象
 *   new UIWindow()        JS 对象先存在，等 windowScene 赋值时才创建
 *
 * 后者让构造和绑定解耦，没有发明新 API——windowScene 本来就是 ObjC 的可写
 * 属性，没有 scene 的 window 在 ObjC 里也是合法状态。
 *
 * 注意要自己保持引用，否则会被回收。
 */
declare class UIWindow extends UIView {
  constructor(scene?: UIWindowScene);
  windowScene: UIWindowScene | null;
  rootViewController: UIViewController | null;
  windowLevel: number;
  readonly isKeyWindow: boolean;
  readonly canBecomeKeyWindow: boolean;
  makeKeyAndVisible(): void;
  makeKeyWindow(): void;

  /** 监听器要在 makeKeyAndVisible() 之前注册，否则事件已经发过了。 */
  addEventListener(
    type: WindowEventName,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
}

/** 页面。可构造——它是我们造的，不是系统给的。 */
declare class UIViewController extends UIResponder {
  constructor();
  readonly view: UIView;
}

// ---------------------------------------------------------------------------
// 文字
// ---------------------------------------------------------------------------

declare class UILabel extends UIView {
  constructor();
  text: string | null;
  // ObjC 里是 null_resettable：写 null 恢复系统默认，读出来永远非 null
  get font(): UIFont;
  set font(value: UIFont | null);
  get textColor(): UIColor;
  set textColor(value: UIColor | null);
  textAlignment: NSTextAlignment;
  lineBreakMode: NSLineBreakMode;
  /** 0 表示不限行数。 */
  numberOfLines: number;
  adjustsFontSizeToFitWidth: boolean;
  minimumScaleFactor: number;
  baselineAdjustment: UIBaselineAdjustment;
  isHighlighted: boolean;
  highlightedTextColor: UIColor | null;
  isEnabled: boolean;
  shadowColor: UIColor | null;
  get shadowOffset(): CGSize;
  set shadowOffset(value: CGSizeLike);
  /** 多行文字算固有高度时要先知道宽度，就靠这个。 */
  preferredMaxLayoutWidth: number;
}

// ---------------------------------------------------------------------------
// 图片上屏
// ---------------------------------------------------------------------------

/**
 * 「图比容器大 / 小 / 比例不一样怎么办」靠的是 `UIView` 的 `contentMode`，
 * 不是这个类的事。
 *
 * `contentMode` 设成 `'scaleAspectFill'` 时记得一起设 `clipsToBounds = true`，
 * 否则溢出的部分会画到容器外面——`contentMode` 只管内容怎么摆，不负责裁剪。
 */
declare class UIImageView extends UIView {
  constructor();
  image: UIImage | null;
  /** `isHighlighted` 为 true 时显示这张，用于按下态。 */
  highlightedImage: UIImage | null;
  isHighlighted: boolean;
  /** 模板图（`renderingMode` 为 `'alwaysTemplate'`）按这个颜色上色。 */
  get tintColor(): UIColor;
  set tintColor(value: UIColor | null);
  /** 逐帧动画还没做（要先能把 GIF 拆成帧），但这个事实先给出来。 */
  readonly isAnimating: boolean;
}
