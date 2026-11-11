// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 控件。会接收触摸、并把触摸翻译成「控件事件」的视图。

/**
 * 16 个控件事件。另外 5 个聚合掩码（AllTouchEvents 之类）不暴露——
 * 一次订阅一个类型。
 */
type UIControlEventType =
  | 'touchDown' | 'touchDownRepeat'
  | 'touchDragInside' | 'touchDragOutside' | 'touchDragEnter' | 'touchDragExit'
  | 'touchUpInside' | 'touchUpOutside' | 'touchCancel'
  | 'valueChanged'
  | 'primaryActionTriggered'
  | 'menuActionTriggered'
  | 'editingDidBegin' | 'editingChanged' | 'editingDidEnd' | 'editingDidEndOnExit';

/** 控件状态。位掩码，所以读出来是数组；都没置上时是 `['normal']`。 */
type UIControlStateName =
  | 'normal' | 'highlighted' | 'disabled' | 'selected' | 'focused';

type UIControlContentHorizontalAlignment =
  | 'center' | 'left' | 'right' | 'fill' | 'leading' | 'trailing';

type UIControlContentVerticalAlignment = 'center' | 'top' | 'bottom' | 'fill';

/** 按钮的外观类型。plain 是 tvOS 专有、roundedRect 是 system 的别名，都没收。 */
type UIButtonType =
  | 'custom' | 'system'
  | 'detailDisclosure' | 'infoLight' | 'infoDark' | 'contactAdd' | 'close';

/** 按钮的语义角色，影响系统给它的配色。 */
type UIButtonRole = 'normal' | 'primary' | 'cancel' | 'destructive';

/**
 * 会接收触摸的视图。按钮、开关、滑块、输入框都是它的子类。
 *
 * 它是 iOS 四套事件机制里唯一**直接注册**的那套——不走 responder chain、
 * 不受手势抢占影响，所以最接近 `addEventListener`。
 */
/**
 * 触摸类控件事件（九个 `touch*`）带的数据。
 *
 * 和导航那几个带负载的事件一样，回调参数的类型没有窄化（`EventTarget`
 * 的基类签名不允许），要拿就转一下型：
 *
 * ```js
 * button.addEventListener('touchUpInside', (e) => {
 *   const { location, tapCount } = /** @type {UIControlTouchEvent} *\/ (e);
 * });
 * ```
 *
 * **只有 `touch*` 那九个有这些字段。** `editingChanged` 这类文本事件、
 * 以及 `valueChanged` / `primaryActionTriggered` / `menuActionTriggered`
 * 都没有——后三个和触点没有固定关系（程序改 `slider.value` 也会发），
 * 不确定就不承诺。这是 Web 的做法：`clientX` 在 `MouseEvent` 上，
 * `KeyboardEvent` 根本没有这个字段。
 */
declare interface UIControlTouchEvent extends Event {
  /**
   * 触点在**这个控件自己的坐标系**里的位置。
   *
   * `sendActionsForControlEvents()` 那条路上没有真实触点，这时是 `null`
   * ——不是 `(0, 0)`，那是个合法坐标，和「没有触点」分不开。
   */
  readonly location: CGPoint | null;
  /** 连击次数。没有真实触点时是 0。 */
  readonly tapCount: number;
}

declare class UIControl extends UIView {
  constructor();

  /** 关掉之后不接收触摸，子类还会画成灰的。默认 `true`。 */
  isEnabled: boolean;
  /** 由 App 自己用，UIKit 不会自动改。默认 `false`。 */
  isSelected: boolean;
  /** 手指按下时 UIKit 自动置上，抬起时清掉。 */
  isHighlighted: boolean;
  /** 由上面三个合成。位掩码，所以是数组；都没置上时是 `['normal']`。 */
  readonly state: readonly UIControlStateName[];
  /** 只在跟踪触摸期间有意义。 */
  readonly isTracking: boolean;
  readonly isTouchInside: boolean;

  contentHorizontalAlignment: UIControlContentHorizontalAlignment;
  contentVerticalAlignment: UIControlContentVerticalAlignment;

  /**
   * 主动触发，一次可以触发多个。
   *
   * `dispatchEvent` **不走**这条——那个是 `EventTarget` 的语义，只派发给
   * JS 监听器，不会让原生以为用户点了。
   */
  sendActionsForControlEvents(types: readonly UIControlEventType[]): void;

  /**
   * 事件名认不出来会抛 `TypeError`——控件的事件类型是有限的，
   * 写错了不该静默不响应。
   */
  addEventListener(
    type: UIControlEventType,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(type: UIControlEventType, callback: EventListener | null): void;
}

/**
 * 按钮。标题、颜色、图片都是**按状态**设的——同一个按钮在 `normal` /
 * `highlighted` / `disabled` 下可以不一样。
 *
 * `new UIButton()` 得到的是 `custom`（什么都不画）；要系统外观用
 * `UIButton.buttonWithType('system')`。
 */
declare class UIButton extends UIControl {
  constructor();
  static buttonWithType(type: UIButtonType): UIButton;

  readonly buttonType: UIButtonType;
  role: UIButtonRole;

  /**
   * `forState` 是状态**数组**，和 `control.state` 读出来的形状一致。
   * 一般只设 `['normal']`，别的状态没设就回退到它。缺了 `forState` 会抛。
   */
  setTitle(title: string | null, options: { forState: readonly UIControlStateName[] }): void;
  setTitleColor(
    color: ColorValue | null,
    options: { forState: readonly UIControlStateName[] },
  ): void;
  setImage(image: UIImage | null, options: { forState: readonly UIControlStateName[] }): void;
  setBackgroundImage(
    image: UIImage | null,
    options: { forState: readonly UIControlStateName[] },
  ): void;

  /** 取值这一侧**只认单个状态**，这是 UIKit 的规定。 */
  titleForState(state: UIControlStateName): string | null;
  titleColorForState(state: UIControlStateName): string | null;
  imageForState(state: UIControlStateName): UIImage | null;
  backgroundImageForState(state: UIControlStateName): UIImage | null;

  /** 当前状态下实际用的那些。 */
  readonly currentTitle: string | null;
  readonly currentTitleColor: string;
  readonly currentImage: UIImage | null;
  readonly currentBackgroundImage: UIImage | null;

  /** 画标题和图的那两个子视图。字体、行数这些要通过它们设。 */
  readonly titleLabel: UILabel | null;
  readonly imageView: UIImageView | null;
}

/** 导航条 / 工具条上一个「项」的公共部分。抽象基类，不能构造。 */
declare class UIBarItem extends NSObject {
  protected constructor();
  title: string | null;
  image: UIImage | null;
  isEnabled: boolean;
  tag: number;
}

type BarButtonEventName = UIBarButtonItemEventType | (string & {});

/**
 * 导航条上的按钮。**它不是 `UIView` 也不是 `UIControl`**——是一个描述对象，
 * UIKit 照着它画。
 *
 * ```js
 * const save = new UIBarButtonItem({ title: '保存', style: 'prominent' });
 * save.addEventListener('primaryActionTriggered', () => submit());
 * page.navigationItem.rightBarButtonItems = [save];
 * ```
 *
 * `systemItem` 只能在构造时给（ObjC 没有对应的可写属性），所以它是**类方法**；
 * `title` / `style` 这些构造完当属性设就行。
 */
declare class UIBarButtonItem extends UIBarItem {
  constructor(options?: {
    title?: string;
    image?: UIImage;
    style?: UIBarButtonItemStyle;
    isEnabled?: boolean;
    /** 放一个自己的 view 进去，等价于 `initWithCustomView:` */
    customView?: UIView;
  });

  /** 系统预置的那二十几个。 */
  static systemItem(name: UIBarButtonSystemItem): UIBarButtonItem;
  /** 占位用的弹性空白。 */
  static flexibleSpace(): UIBarButtonItem;
  /** 占位用的固定宽度空白。 */
  static fixedSpace(width: number): UIBarButtonItem;

  /** 默认 `'plain'`。写 `'done'` 读回 `'prominent'`。 */
  style: UIBarButtonItemStyle;
  /** 默认 `0`，只对固定宽度的项有意义。 */
  width: number;
  isHidden: boolean;
  customView: UIView | null;

  addEventListener(
    type: BarButtonEventName,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
}
