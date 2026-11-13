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
type UIGestureRecognizerEventType = 'began' | 'changed' | 'ended' | 'cancelled';

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
 * 手势识别器的基类。不能直接 `new`，用它的子类。
 *
 * 识别器不是视图。用 `view.addGestureRecognizer()` 挂到一个视图上之后，它
 * 收这个视图**和所有子视图**上的触摸。
 *
 * 四个事件就是四个状态：
 *
 * | 事件 | 什么时候 |
 * | --- | --- |
 * | `began` | 连续手势（长按）认出来的那一刻 |
 * | `changed` | 连续手势进行中，手指动了 |
 * | `ended` | 连续手势正常结束；**离散手势（点按）认出来时只发这一个** |
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
   * `touchCancel`）。`false`：视图照常收完这次触摸。
   */
  cancelsTouchesInView: boolean;
  /** 默认 `false`。`true`：识别失败之前，视图收不到触摸开始。 */
  delaysTouchesBegan: boolean;
  /** 默认 `true`：识别失败之后，视图才收到触摸结束。 */
  delaysTouchesEnded: boolean;
  /** 这一刻参与手势的手指数。 */
  readonly numberOfTouches: number;
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
