// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 手势识别器。挂在视图上的对象，认出某种手势时派发事件。

/**
 * 识别器的状态。
 *
 * ObjC 里还有一个 `recognized`，它是 `ended` 的别名（同一个数值），这里只有
 * `ended`。
 */
type UIGestureRecognizerState =
  | 'possible' | 'began' | 'changed' | 'ended' | 'cancelled' | 'failed';

/** 手势事件的名字。就是会通知出来的那四个状态。 */
type UIGestureRecognizerEventType = 'beforebegin' | 'began' | 'changed' | 'ended' | 'cancelled';

/** 轻扫的方向。`UISwipeGestureRecognizer.direction` 是它的数组。 */
type UISwipeGestureRecognizerDirection = 'right' | 'left' | 'up' | 'down';

/**
 * 屏幕的边。`UIScreenEdgePanGestureRecognizer.edges` 是它的数组。
 *
 * ObjC 里还有一个 `UIRectEdgeAll`，这里没有：四条边写全就是它。
 */
type UIRectEdge = 'top' | 'left' | 'bottom' | 'right';

/**
 * 滚动输入的种类。`'discrete'` 是鼠标滚轮那样一格一格的，`'continuous'` 是
 * 触控板那样连续的。`UIPanGestureRecognizer.allowedScrollTypesMask` 是它的数组。
 */
type UIScrollTypeMask = 'discrete' | 'continuous';

/**
 * 手势事件带的数据。
 *
 * 回调参数的类型没有窄化（`EventTarget` 的基类签名不允许），要拿就转一下型：
 *
 * ```js
 * tap.addEventListener('ended', (e) => {
 *   const { location } = /** @type {UIGestureRecognizerEvent} *\/ (e);
 * });
 * ```
 *
 * 这两个值**只能从事件上拿**：回调比手势晚执行，回头在识别器上读不到当时的值。
 *
 * 拖动、捏合、旋转的事件各自多带两个字段，见 `UIPanGestureRecognizerEvent`、
 * `UIPinchGestureRecognizerEvent`、`UIRotationGestureRecognizerEvent`。
 */
declare interface UIGestureRecognizerEvent extends Event {
  /**
   * 手势的位置，在**识别器所在视图的坐标系**里，单位是点。多根手指时是
   * 它们的中心。要别的坐标系用 `view.convertPoint()`。
   */
  readonly location: CGPoint | null;
  /** 事件发生时参与手势的手指数。单指手势抬手时的 `ended` 里也是 1。 */
  readonly numberOfTouches: number;
}

/**
 * 拖动（`UIPanGestureRecognizer`、`UIScreenEdgePanGestureRecognizer`）的事件
 * 带的数据。
 */
declare interface UIPanGestureRecognizerEvent extends UIGestureRecognizerEvent {
  /**
   * 从手势开始到这个事件为止，手指移动了多少。在**识别器所在视图的坐标系**
   * 里，单位是点。
   */
  readonly translation: CGPoint;
  /** 这个事件发生时手指移动的速度，单位是点每秒，坐标系同上。 */
  readonly velocity: CGPoint;
}

/** 捏合（`UIPinchGestureRecognizer`）的事件带的数据。 */
declare interface UIPinchGestureRecognizerEvent extends UIGestureRecognizerEvent {
  /** 两指间距相对手势开始时的倍数。张开大于 1，捏拢小于 1。 */
  readonly scale: number;
  /** `scale` 每秒变化多少。 */
  readonly velocity: number;
}

/** 旋转（`UIRotationGestureRecognizer`）的事件带的数据。 */
declare interface UIRotationGestureRecognizerEvent extends UIGestureRecognizerEvent {
  /** 相对手势开始时转了多少，单位是**弧度**。 */
  readonly rotation: number;
  /** 旋转的速度，单位是弧度每秒。 */
  readonly velocity: number;
}

/**
 * 手势识别器的基类。不能直接 `new`，用它的子类。
 *
 * 识别器不是视图。用 `view.addGestureRecognizer()` 挂到一个视图上之后，它
 * 收这个视图**和所有子视图**上的触摸。
 *
 * 四个事件就是四个状态：
 *
 * | 事件 | 什么时候 |
 * | --- | --- |
 * | `began` | 连续手势（长按、拖动、捏合、旋转）认出来的那一刻 |
 * | `changed` | 连续手势进行中，手指动了 |
 * | `ended` | 连续手势正常结束；**离散手势（点按、轻扫）认出来时只发这一个** |
 * | `cancelled` | 连续手势被打断（来电、识别器被禁用） |
 */
declare class UIGestureRecognizer extends NSObject {
  constructor();
  addEventListener(
    type: UIGestureRecognizerEventType,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: UIGestureRecognizerEventType,
    callback: EventListener | null,
  ): void;

  /**
   * 当前状态。**回调里读到的是回调执行那一刻的状态**：点按的 `ended`
   * 回调里是 `'possible'`（识别器已经重置），长按的 `began` 回调里手指
   * 还按着时是 `'began'`。要知道是哪个阶段，看事件名。
   */
  readonly state: UIGestureRecognizerState;
  /** 挂在哪个视图上。没挂时是 `null`。 */
  readonly view: UIView | null;
  /** 默认 `true`。设成 `false` 就不再收触摸；正在识别的手势会被取消。 */
  isEnabled: boolean;
  /**
   * 默认 `true`：认出手势之后，视图里正在进行的触摸被取消（控件会收到
   * `touchcancel`）。`false`：视图照常收完这次触摸。
   */
  cancelsTouchesInView: boolean;
  /** 默认 `false`。`true`：识别失败之前，视图收不到触摸开始。 */
  delaysTouchesBegan: boolean;
  /** 默认 `true`：识别失败之后，视图才收到触摸结束。 */
  delaysTouchesEnded: boolean;
  /** 这一刻参与手势的手指数。 */
  readonly numberOfTouches: number;

  /**
   * 让这个识别器等另一个识别器确定认不出之后再认。另一个认出来了，这一个
   * 就不认。典型用法是单击等双击失败：
   *
   * ```js
   * singleTap.requireGestureRecognizerToFail(doubleTap);
   * ```
   *
   * 关系建了之后不能撤销。两个识别器互不保管对方，各自要加在视图上。
   */
  requireGestureRecognizerToFail(otherGestureRecognizer: UIGestureRecognizer): void;

  /**
   * 能和哪些识别器同时识别。默认空数组：一个识别器认出手势之后，别的就不认了。
   * 可以填 UIKit 自带的识别器，比如 `scroll.panGestureRecognizer`。只能写在自己
   * `new` 的识别器上，UIKit 自带的识别器上写了抛 `TypeError`。
   */
  get recognizesSimultaneouslyWith(): UIGestureRecognizer[];
  set recognizesSimultaneouslyWith(value: readonly UIGestureRecognizer[]);
}

/** 点按。离散手势：认出来时派发一次 `ended`。 */
declare class UITapGestureRecognizer extends UIGestureRecognizer {
  constructor();
  /** 要点几下才算。默认 1；设成 2 就是双击。 */
  numberOfTapsRequired: number;
  /** 要几根手指。默认 1。 */
  numberOfTouchesRequired: number;
}

/**
 * 长按。连续手势：按够时间派发 `began`，手指移动派发 `changed`，抬起派发
 * `ended`。
 */
declare class UILongPressGestureRecognizer extends UIGestureRecognizer {
  constructor();
  /** 按住多久才算，单位是**秒**。默认 0.5。 */
  minimumPressDuration: number;
  /** 认出来之前手指最多能移动多远，单位是点。默认 10。认出来之后不限。 */
  allowableMovement: number;
  /** 按住之前要先完整点几下。默认 0。 */
  numberOfTapsRequired: number;
  /** 要几根手指。默认 1。 */
  numberOfTouchesRequired: number;
}

/**
 * 拖动。连续手势：手指按下并移动一小段距离后派发 `began`，之后每次移动派发
 * `changed`，全部手指抬起时派发 `ended`。
 *
 * 事件对象是 `UIPanGestureRecognizerEvent`，带 `translation` 和 `velocity`。
 */
declare class UIPanGestureRecognizer extends UIGestureRecognizer {
  constructor();
  /** 最少要几根手指。默认 1。 */
  minimumNumberOfTouches: number;
  /** 最多能有几根手指按着。默认 4294967295，等于不限。 */
  maximumNumberOfTouches: number;
  /**
   * 认哪几种滚动输入（鼠标滚轮、触控板）。默认是空数组：滚动输入不触发拖动。
   */
  allowedScrollTypesMask: UIScrollTypeMask[];

  /**
   * 从手势开始到现在手指移动了多少，换算到 `view` 的坐标系里，单位是点。
   * `view` 传 `null` 是窗口的坐标系。没有手势在进行时是 `(0, 0)`。
   *
   * 回调里调它，读到的是回调执行那一刻的值。事件发生那一刻的值在事件对象的
   * `translation` 上。
   */
  translationInView(view: UIView | null): CGPoint;
  /**
   * 把位移改成 `translation`，之后的移动从这个值接着累计。没有手势在进行时
   * 不生效。
   */
  setTranslation(translation: CGPointLike, options: { inView: UIView | null }): void;
  /**
   * 手指移动的速度，换算到 `view` 的坐标系里，单位是点每秒。`view` 传 `null`
   * 是窗口的坐标系。没有手势在进行时是 `(0, 0)`。
   */
  velocityInView(view: UIView | null): CGPoint;
}

/**
 * 捏合。连续手势，两根手指。
 *
 * 事件对象是 `UIPinchGestureRecognizerEvent`，带 `scale` 和 `velocity`。
 */
declare class UIPinchGestureRecognizer extends UIGestureRecognizer {
  constructor();
  /**
   * 两指间距相对手势开始时的倍数。默认 1。可写：手势进行中写它，之后从写进去
   * 的值接着算。
   */
  scale: number;
  /** `scale` 每秒变化多少。没有手势在进行时是 0。 */
  readonly velocity: number;
}

/**
 * 旋转。连续手势，两根手指。
 *
 * 事件对象是 `UIRotationGestureRecognizerEvent`，带 `rotation` 和 `velocity`。
 */
declare class UIRotationGestureRecognizer extends UIGestureRecognizer {
  constructor();
  /** 相对手势开始时转了多少，单位是**弧度**。默认 0。可写。 */
  rotation: number;
  /** 旋转的速度，单位是弧度每秒。没有手势在进行时是 0。 */
  readonly velocity: number;
}

/**
 * 轻扫。离散手势：手指朝 `direction` 里的某个方向快速划过时，派发一次
 * `ended`。
 */
declare class UISwipeGestureRecognizer extends UIGestureRecognizer {
  constructor();
  /** 要几根手指。默认 1。 */
  numberOfTouchesRequired: number;
  /**
   * 认哪几个方向。默认 `['right']`。
   *
   * 给了多个方向时，事件不说明认出的是哪一个。要区分方向，每个方向建一个
   * 识别器。读出来的顺序固定是 `right`、`left`、`up`、`down`。
   */
  direction: UISwipeGestureRecognizerDirection[];
}

/**
 * 屏幕边缘拖动。只认从屏幕边缘滑进来的拖动，其余和 `UIPanGestureRecognizer`
 * 相同。
 *
 * 三个默认值和父类不同：`edges` 是空数组（不设就什么都认不出）、
 * `maximumNumberOfTouches` 是 1、`delaysTouchesBegan` 是 `true`。
 */
declare class UIScreenEdgePanGestureRecognizer extends UIPanGestureRecognizer {
  constructor();
  /**
   * 认哪几条边，按当前的界面方向算。默认是空数组。读出来的顺序固定是
   * `top`、`left`、`bottom`、`right`。
   */
  edges: UIRectEdge[];
}
