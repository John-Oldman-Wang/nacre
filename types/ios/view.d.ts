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
   * 内边距，单位是点。`layoutMarginsGuide` 和开了
   * `isLayoutMarginsRelativeArrangement` 的 `UIStackView` 按它缩进。
   *
   * `leading` / `trailing` 跟着文字方向走。读出来的值不一定等于写进去的：
   * `insetsLayoutMarginsFromSafeArea` 为 `true` 时系统会把安全区加上去。
   */
  get directionalLayoutMargins(): NSDirectionalEdgeInsets;
  set directionalLayoutMargins(value: NSDirectionalEdgeInsetsLike);
  /**
   * 同一份内边距，左右写死的版本。和 `directionalLayoutMargins` 是同一份
   * 数据，写哪个另一个都跟着变。
   */
  get layoutMargins(): UIEdgeInsets;
  set layoutMargins(value: UIEdgeInsetsLike);
  /**
   * 默认 `true`：视图伸到安全区外面的那几条边，内边距自动加上安全区。
   * 要「写多少就是多少」就设成 `false`。
   */
  insetsLayoutMarginsFromSafeArea: boolean;
  /** 默认 `false`。`true`：父视图的内边距比自己大时，用父视图的。 */
  preservesSuperviewLayoutMargins: boolean;
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
  get backgroundColor(): string | null;
  set backgroundColor(value: ColorValue | null);
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

  // 手势识别器。视图持有它们；一个识别器同一时刻只能挂在一个视图上
  /** 每次读是新数组，里面的对象是同一个。系统自带的识别器也在里面。 */
  readonly gestureRecognizers: readonly UIGestureRecognizer[];
  /** 识别器原来挂在别的视图上时，会先从那个视图上摘下来。 */
  addGestureRecognizer(recognizer: UIGestureRecognizer): void;
  removeGestureRecognizer(recognizer: UIGestureRecognizer): void;

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
  /**
   * 仿射变换。
   *
   * **非单位矩阵时 `frame` 就没有意义了**（UIKit 的规定）——要改位置和
   * 大小请用 `bounds` 和 `center`。
   */
  transform: CGAffineTransform;
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
  /**
   * 键盘避让。**收起时贴安全区底边，弹出时贴键盘顶边**，所以把内容的底边
   * 约束到它的 `topAnchor`，一条约束管两种状态，而且和键盘动画同步。
   */
  readonly keyboardLayoutGuide: UIKeyboardLayoutGuide;
  /**
   * 让这棵子树里的 first responder 交出身份——收键盘最常用的那一个。
   * `force` 为 `true` 时不管对方愿不愿意。
   */
  endEditing(force?: boolean): boolean;
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

/**
 * 导航条上「这一页」的那份配置。不能构造——每个 `UIViewController` 自带一个。
 *
 * ```js
 * page.navigationItem.title = '设置';
 * page.navigationItem.rightBarButtonItems = [new UIBarButtonItem({ title: '完成' })];
 * ```
 */
declare class UINavigationItem extends NSObject {
  private constructor();
  /** 导航条正中那行字。和 `UIViewController.title` 是同一个东西。 */
  title: string | null;
  /** 副标题（iOS 26 起）。 */
  subtitle: string | null;
  /** 下一页返回按钮上的字。不设就用这一页的 `title`。 */
  backButtonTitle: string | null;
  /** 藏掉返回按钮。**藏了之后左滑返回也跟着失效。** */
  hidesBackButton: boolean;
  /** 放一个自定义 view 当标题。设了它，`title` 就被忽略。 */
  titleView: UIView | null;
  /** 左侧按钮。**设了之后左滑返回会失效**——系统不再敢假设返回语义。 */
  leftBarButtonItems: readonly UIBarButtonItem[];
  /** 右侧按钮。 */
  rightBarButtonItems: readonly UIBarButtonItem[];
}

type NavEventName = UINavigationControllerEventType | (string & {});

/**
 * 页面栈。push 进去、pop 出来，返回按钮和边缘返回手势都是系统给的。
 *
 * ```js
 * const home = new UIViewController();
 * home.title = '首页';
 * const nav = new UINavigationController(home);
 * win.rootViewController = nav;
 *
 * const detail = new UIViewController();
 * detail.title = '详情';
 * nav.pushViewController(detail, { animated: true });
 * ```
 *
 * 不用自己保持引用：栈持有栈里的页面，而栈由窗口持有。
 */
declare class UINavigationController extends UIViewController {
  /** 不传就是空栈；传一个就等于 `initWithRootViewController:`。 */
  constructor(rootViewController?: UIViewController);

  /** 当前的页面栈，栈底在前。读出来是快照，改它用赋值或 `setViewControllers`。 */
  viewControllers: readonly UIViewController[];
  /** 栈顶那一个。 */
  readonly topViewController: UIViewController | null;
  /** 有模态页就是模态页，否则同 `topViewController`。 */
  readonly visibleViewController: UIViewController | null;

  /** 压栈。已经在栈上的页面不会被重复压入。 */
  pushViewController(viewController: UIViewController, options?: { animated?: boolean }): void;
  /** 出栈，返回被弹出的那一个；栈底弹不动时返回 `null`。 */
  popViewController(options?: { animated?: boolean }): UIViewController | null;
  /** 一直弹到这一页在栈顶，返回被弹掉的那些。 */
  popToViewController(
    viewController: UIViewController,
    options?: { animated?: boolean },
  ): readonly UIViewController[];
  /** 弹到只剩栈底那一个。 */
  popToRootViewController(options?: { animated?: boolean }): readonly UIViewController[];
  /** 整栈替换。`animated` 时系统按新栈顶在不在旧栈里决定演 push 还是 pop。 */
  setViewControllers(
    viewControllers: readonly UIViewController[],
    options?: { animated?: boolean },
  ): void;

  /** 导航条藏不藏。默认 `false`。 */
  isNavigationBarHidden: boolean;
  /** 带动画地藏/显导航条。 */
  setNavigationBarHidden(hidden: boolean, options?: { animated?: boolean }): void;

  addEventListener(
    type: NavEventName,
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
  /** 导航条上的标题。下一页的返回按钮默认显示这个。 */
  title: string | null;
  /** 这一页在导航条上的配置。VC 自己懒加载的，永远非 `null`。 */
  readonly navigationItem: UINavigationItem;

  /**
   * 模态呈现一个页面。`completion` 是 block，所以这里是 Promise——
   * 呈现动画跑完才兑现。
   */
  presentViewController(
    viewController: UIViewController,
    options?: { animated?: boolean },
  ): Promise<boolean>;
  /** 关掉自己呈现出来的那个模态页。 */
  dismissViewController(options?: { animated?: boolean }): Promise<boolean>;
  /** 它呈现出来的那个模态页。 */
  readonly presentedViewController: UIViewController | null;
  /** 呈现它的那一个。 */
  readonly presentingViewController: UIViewController | null;
  /** 怎么呈现。默认 `'automatic'`（iPhone 上落到 `'pageSheet'`）。 */
  modalPresentationStyle: UIModalPresentationStyle;
  /** 进出动画。默认 `'coverVertical'`。 */
  modalTransitionStyle: UIModalTransitionStyle;
  /**
   * 打开之后用户**拖不走它**，只能走你给的出口。默认 `false`。
   *
   * 这是 `presentationControllerShouldDismiss:` 那个同步回调的
   * 「预先声明的状态」版本——所以那条不需要同步回 JS 的能力。
   */
  isModalInPresentation: boolean;

  addEventListener(
    type: UIPresentationEventType | (string & {}),
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  /** 它所在的导航控制器；不在栈上就是 `null`。 */
  readonly navigationController: UINavigationController | null;
  /** 容器父控制器（导航控制器就是一种容器）。 */
  readonly parentViewController: UIViewController | null;

  /**
   * 子控制器，按加入的顺序。自己写容器（比如自己画 tab 条）时用。
   * 导航控制器、tab 控制器管着的页面也在这里面。
   */
  readonly childViewControllers: readonly UIViewController[];
  /**
   * 把一个页面收成子控制器。**只建立父子关系，不动视图**，完整的三句是：
   *
   * ```js
   * parent.addChildViewController(child);
   * parent.view.addSubview(child.view);
   * child.didMoveToParentViewController(parent);
   * ```
   *
   * `child` 已经有父控制器时，会先从那边移除。
   */
  addChildViewController(childController: UIViewController): void;
  /** 离开父控制器。之前要先调 `willMoveToParentViewController(null)`，并把视图摘掉。 */
  removeFromParentViewController(): void;
  /** 通知「即将换父控制器」。`null` 表示即将离开。`addChildViewController` 会替你调，移除时要自己调。 */
  willMoveToParentViewController(parent: UIViewController | null): void;
  /** 通知「已经换好父控制器」。加入之后要自己调；`removeFromParentViewController` 会替你调 `null` 的那次。 */
  didMoveToParentViewController(parent: UIViewController | null): void;
  /** 在系统的安全区之外再让出的边距，单位 pt。默认四边都是 0。 */
  additionalSafeAreaInsets: UIEdgeInsets;
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
  get textColor(): string;
  set textColor(value: ColorValue | null);
  textAlignment: NSTextAlignment;
  lineBreakMode: NSLineBreakMode;
  /** 0 表示不限行数。 */
  numberOfLines: number;
  adjustsFontSizeToFitWidth: boolean;
  minimumScaleFactor: number;
  baselineAdjustment: UIBaselineAdjustment;
  isHighlighted: boolean;
  get highlightedTextColor(): string | null;
  set highlightedTextColor(value: ColorValue | null);
  isEnabled: boolean;
  get shadowColor(): string | null;
  set shadowColor(value: ColorValue | null);
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
  get tintColor(): string;
  set tintColor(value: ColorValue | null);
  /** 逐帧动画还没做（要先能把 GIF 拆成帧），但这个事实先给出来。 */
  readonly isAnimating: boolean;
}
