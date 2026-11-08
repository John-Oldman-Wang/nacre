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
    color: UIColor | null,
    options: { forState: readonly UIControlStateName[] },
  ): void;
  setImage(image: UIImage | null, options: { forState: readonly UIControlStateName[] }): void;
  setBackgroundImage(
    image: UIImage | null,
    options: { forState: readonly UIControlStateName[] },
  ): void;

  /** 取值这一侧**只认单个状态**，这是 UIKit 的规定。 */
  titleForState(state: UIControlStateName): string | null;
  titleColorForState(state: UIControlStateName): UIColor | null;
  imageForState(state: UIControlStateName): UIImage | null;
  backgroundImageForState(state: UIControlStateName): UIImage | null;

  /** 当前状态下实际用的那些。 */
  readonly currentTitle: string | null;
  readonly currentTitleColor: UIColor;
  readonly currentImage: UIImage | null;
  readonly currentBackgroundImage: UIImage | null;

  /** 画标题和图的那两个子视图。字体、行数这些要通过它们设。 */
  readonly titleLabel: UILabel | null;
  readonly imageView: UIImageView | null;
}
