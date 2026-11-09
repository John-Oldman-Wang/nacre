// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 视图。UIView 和它的几个子类。Auto Layout 的部分在 layout.d.ts。

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

  /** 圆角、边框、阴影都在这上面。view 和 layer 一对一，取两次是同一个对象。 */
  readonly layer: CALayer;

  // ---- Auto Layout ----

  /**
   * 用约束之前先设成 false，否则系统会把 frame 翻译成一组 required
   * 优先级的约束，和你写的那些直接打架。默认 true。
   */
  translatesAutoresizingMaskIntoConstraints: boolean;

  readonly leadingAnchor: NSLayoutXAxisAnchor;
  readonly trailingAnchor: NSLayoutXAxisAnchor;
  readonly leftAnchor: NSLayoutXAxisAnchor;
  readonly rightAnchor: NSLayoutXAxisAnchor;
  readonly topAnchor: NSLayoutYAxisAnchor;
  readonly bottomAnchor: NSLayoutYAxisAnchor;
  readonly widthAnchor: NSLayoutDimension;
  readonly heightAnchor: NSLayoutDimension;
  readonly centerXAnchor: NSLayoutXAxisAnchor;
  readonly centerYAnchor: NSLayoutYAxisAnchor;
  readonly firstBaselineAnchor: NSLayoutYAxisAnchor;
  readonly lastBaselineAnchor: NSLayoutYAxisAnchor;

  /** 刘海、Home 指示条、状态栏让出来的那块。 */
  readonly safeAreaLayoutGuide: UILayoutGuide;
  readonly layoutMarginsGuide: UILayoutGuide;
  /** 一行字的舒适宽度，长文本用它比用 safeArea 好读。 */
  readonly readableContentGuide: UILayoutGuide;

  /** 装在这个 view 上的约束——不是「影响这个 view 的约束」。 */
  readonly constraints: readonly NSLayoutConstraint[];
  readonly layoutGuides: readonly UILayoutGuide[];
  addLayoutGuide(guide: UILayoutGuide): void;
  removeLayoutGuide(guide: UILayoutGuide): void;

  invalidateIntrinsicContentSize(): void;

  /** 「别把我拉得比固有尺寸大」的坚持程度。调低它，这一个就去吃掉剩余空间。 */
  contentHuggingPriorityForAxis(axis: UILayoutConstraintAxis): number;
  setContentHuggingPriority(
    priority: UILayoutPriorityLike,
    options: { forAxis: UILayoutConstraintAxis },
  ): void;
  /** 「别把我压得比固有尺寸小」的坚持程度。 */
  contentCompressionResistancePriorityForAxis(axis: UILayoutConstraintAxis): number;
  setContentCompressionResistancePriority(
    priority: UILayoutPriorityLike,
    options: { forAxis: UILayoutConstraintAxis },
  ): void;

  /** 按整棵子树的约束解出来该多大。sizeThatFits 问的是 view 自己的意见。 */
  systemLayoutSizeFittingSize(size: CGSizeLike): CGSize;
  systemLayoutSizeFittingSize(
    size: CGSizeLike,
    options: {
      withHorizontalFittingPriority: UILayoutPriorityLike;
      verticalFittingPriority: UILayoutPriorityLike;
    },
  ): CGSize;

  /** 约束不够、有多个合法解。UIKit 不会主动报，只能自己问。 */
  readonly hasAmbiguousLayout: boolean;
  /** 在几个同样合法的解之间跳一下，肉眼就能看出哪里没约束够。 */
  exerciseAmbiguityInLayout(): void;
  constraintsAffectingLayoutForAxis(
    axis: UILayoutConstraintAxis,
  ): readonly NSLayoutConstraint[];
}

type ScrollEventName = UIScrollViewEventType | (string & {});

/**
 * 可滚动的视图。
 *
 * ```js
 * const scroller = new UIScrollView();
 * const column = new UIStackView();
 * column.axis = 'vertical';
 * scroller.addSubview(column);
 * NSLayoutConstraint.activateConstraints([
 *   // 四边钉 contentLayoutGuide：内容多大由它决定
 *   column.topAnchor.constraintEqualToAnchor(scroller.contentLayoutGuide.topAnchor),
 *   column.bottomAnchor.constraintEqualToAnchor(scroller.contentLayoutGuide.bottomAnchor),
 *   column.leadingAnchor.constraintEqualToAnchor(scroller.contentLayoutGuide.leadingAnchor),
 *   column.trailingAnchor.constraintEqualToAnchor(scroller.contentLayoutGuide.trailingAnchor),
 *   // 宽度钉 frameLayoutGuide：横向不滚
 *   column.widthAnchor.constraintEqualToAnchor(scroller.frameLayoutGuide.widthAnchor),
 * ]);
 * ```
 *
 * 滚动由 UIKit 在**主线程**驱动，JS 只收通知。`scroll` 事件不可取消，而且
 * 同一轮里的多次滚动会**合并成一次**——所以别指望用事件的个数计数，要位置
 * 就读 `contentOffset`。
 */
declare class UIScrollView extends UIView {
  constructor();

  /** 滚动位置。内容左上角相对可视区左上角的偏移，向下滚为正。 */
  contentOffset: CGPoint;
  /** 内容多大。用约束钉 `contentLayoutGuide` 的话不用自己设。 */
  contentSize: CGSize;
  /** 内容四周额外的可滚动余量。 */
  contentInset: UIEdgeInsets;
  /** `contentInset` 加上系统自己补的那部分（安全区）。 */
  readonly adjustedContentInset: UIEdgeInsets;
  /** 系统要不要把安全区算进 `contentInset`。默认 `'automatic'`。 */
  contentInsetAdjustmentBehavior: UIScrollViewContentInsetAdjustmentBehavior;

  /** 带动画地滚到某个位置。动画结束发 `scrollanimationend`。 */
  setContentOffset(offset: CGPoint, options?: { animated?: boolean }): void;
  /** 滚到这个矩形刚好可见为止。已经完全可见就什么都不做。 */
  scrollRectToVisible(rect: CGRect, options?: { animated?: boolean }): void;
  /** 闪一下滚动指示条，提示「这里能滚」。 */
  flashScrollIndicators(): void;

  /** 内容的范围。四边钉它，内容多大就由内容自己说了算。 */
  readonly contentLayoutGuide: UILayoutGuide;
  /** 可视范围。宽度钉它就等于「横向不滚」。 */
  readonly frameLayoutGuide: UILayoutGuide;

  /** 默认 `true`。临时关掉拖动用它。 */
  isScrollEnabled: boolean;
  /** 拖动时锁住一个方向。默认 `false`。 */
  isDirectionalLockEnabled: boolean;
  /** 到边回弹。默认 `true`。 */
  bounces: boolean;
  /** 内容比可视区小也允许纵向拖。默认 `false`，要 `bounces` 也开着。 */
  alwaysBounceVertical: boolean;
  /** 横向版本。默认 `false`。 */
  alwaysBounceHorizontal: boolean;
  /** 翻页：停在 `bounds` 宽/高的整数倍上。默认 `false`。 */
  isPagingEnabled: boolean;
  /** 点状态栏回到顶部。默认 `true`，同一时刻只能有一个开着。 */
  scrollsToTop: boolean;
  /** 延迟把触摸交给内容，先看是不是在拖。默认 `true`。 */
  delaysContentTouches: boolean;
  /** 已经按住内容后还能不能改为拖动。默认 `true`。 */
  canCancelContentTouches: boolean;

  /** 默认 `true`。 */
  showsVerticalScrollIndicator: boolean;
  /** 默认 `true`。 */
  showsHorizontalScrollIndicator: boolean;
  /** 指示条外观。默认 `'default'`。 */
  indicatorStyle: UIScrollViewIndicatorStyle;
  verticalScrollIndicatorInsets: UIEdgeInsets;
  horizontalScrollIndicatorInsets: UIEdgeInsets;
  /** 让系统按安全区自动算指示条的边距。默认 `true`。 */
  automaticallyAdjustsScrollIndicatorInsets: boolean;

  /** 松手后减速的快慢。默认 `'normal'`。 */
  decelerationRate: UIScrollViewDecelerationRate;

  /** 手指按在上面（还不一定在拖）。 */
  readonly isTracking: boolean;
  /** 正在拖。 */
  readonly isDragging: boolean;
  /** 松手后正在惯性滑动。 */
  readonly isDecelerating: boolean;
  /** 正在跑 `setContentOffset` 的动画。 */
  readonly isScrollAnimating: boolean;

  addEventListener(
    type: ScrollEventName,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
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
 * 不用自己保持引用：绑定场景的那一刻，场景就持有了这个窗口
 * （UIWindowScene.windows 是原生侧的所有权，运行时在 JS 侧也镜像了它）。
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
