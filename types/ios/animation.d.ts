// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 动画。CAAnimation 一族、时间曲线、事务。

/**
 * 时间曲线。两种来源：五个内置名字，或者四个控制点的三次贝塞尔。
 *
 * 不可 `new`——ObjC 那边的 `initWithControlPoints` 要四个浮点数，而构造
 * 通道只传对象句柄。
 */
declare class CAMediaTimingFunction extends NSObject {
  private constructor();
  static functionWithName(name: CAMediaTimingFunctionName): CAMediaTimingFunction;
  static functionWithControlPoints(
    c1x: number, c1y: number, c2x: number, c2y: number,
  ): CAMediaTimingFunction;
  /**
   * ObjC 那边是出参（`float[2]`），这里改成返回一个点。
   *
   * 0 和 3 是端点，永远是 (0, 0) 和 (1, 1)；1 和 2 才是控制点。
   */
  controlPointAtIndex(index: number): CGPoint;
}

/**
 * 动画的基类。不可直接构造，用 {@link CABasicAnimation}。
 *
 * 它是 `EventTarget`：
 *
 * ```js
 * anim.addEventListener('stop', (e) => {
 *   console.log('动画结束，跑完了吗：', e.finished);
 * });
 * ```
 *
 * `stop` 事件上的 `finished` 是**事件自带的**——那个事实在动画对象上读
 * 不出来。被 `removeAnimationForKey` 掐掉时它是 `false`。
 */
declare class CAAnimation extends NSObject {
  protected constructor();
  addEventListener(
    type: CAAnimationEventType,
    listener: (event: CAAnimationEvent) => void,
    options?: { once?: boolean; signal?: AbortSignal },
  ): void;
  removeEventListener(
    type: CAAnimationEventType,
    listener: (event: CAAnimationEvent) => void,
  ): void;

  // ---- 时间（来自 CAMediaTiming） ----
  /**
   * 秒。**0 不是「不动画」**：加到图层上时 0 会被换成当前事务的
   * `animationDuration`，没有设过的话是 0.25 秒。
   */
  duration: number;
  /** 相对于父级时间轴的开始时刻。默认 0 = 立刻。 */
  beginTime: number;
  /** 时间流速。2 是两倍快，0 是停住。默认 1。 */
  speed: number;
  timeOffset: number;
  /** 重复几次，可以是小数（1.5 = 跑一遍半）。无限循环用 `Infinity`。 */
  repeatCount: number;
  repeatDuration: number;
  /** 跑完再倒着跑回来。配 `repeatCount` 做脉动。 */
  autoreverses: boolean;
  /** 活动区间之外属性显示成什么。默认 `'removed'`。 */
  fillMode: CAMediaTimingFillMode;

  // ---- 曲线和收尾 ----
  timingFunction: CAMediaTimingFunction | null;
  /**
   * 默认 `true`：动画跑完就被摘掉，属性**弹回模型值**。
   *
   * 这是 Core Animation 最常被当成 bug 的行为。正确的做法不是把它设成
   * `false`（那会让图层一直顶着一个已经结束的动画），而是**在加动画的
   * 同时把模型值也设成终点值**。
   */
  removedOnCompletion: boolean;
}

/** 动画的 `start` / `stop` 事件。`finished` 只有 `stop` 上有。 */
declare interface CAAnimationEvent extends Event {
  /** 动画是自己跑完的（`true`），还是被摘掉的（`false`）。只有 `stop` 有。 */
  readonly finished?: boolean;
}

/** 动画某一个属性。自己不可构造，用 {@link CABasicAnimation}。 */
declare class CAPropertyAnimation extends CAAnimation {
  protected constructor();
  /** 动哪个属性。写一个运行时不认的名字会当场抛，并把全表列出来。 */
  keyPath: CAAnimationKeyPath | null;
}

/**
 * 从一个值走到另一个值。
 *
 * ```js
 * const draw = CABasicAnimation.animationWithKeyPath('strokeEnd');
 * draw.fromValue = 0;
 * draw.toValue = 1;
 * draw.duration = 0.8;
 * draw.timingFunction = CAMediaTimingFunction.functionWithName('easeInEaseOut');
 * shape.strokeEnd = 1;                      // 模型值也设过去，否则会弹回
 * shape.addAnimation(draw, { forKey: 'draw' });
 * ```
 *
 * `fromValue` / `toValue` / `byValue` 该放什么类型**由 `keyPath` 决定**：
 * `'opacity'` 要数字，`'position'` 要 `CGPoint`，`'strokeColor'` 要颜色，
 * `'path'` 要 `UIBezierPath`。所以**要先设 `keyPath`**，否则赋值时抛。
 */
declare class CABasicAnimation extends CAPropertyAnimation {
  /** 建一个还没有 `keyPath` 的动画。一般直接用 `animationWithKeyPath`。 */
  constructor();
  static animationWithKeyPath(keyPath: CAAnimationKeyPath): CABasicAnimation;

  get fromValue(): CAAnimationValue | null;
  set fromValue(value: CAAnimationValueInput | null);
  get toValue(): CAAnimationValue | null;
  set toValue(value: CAAnimationValueInput | null);
  /** 相对量：`toValue = fromValue + byValue`。 */
  get byValue(): CAAnimationValue | null;
  set byValue(value: CAAnimationValueInput | null);
}

/** 读出来的动画值。颜色读出来是字符串，和图层上的颜色属性一致。 */
type CAAnimationValue = number | CGPoint | CGSize | CGRect | string | UIBezierPath;
/** 写进去的动画值。具体要哪一种由 `keyPath` 决定，给错了当场抛。 */
type CAAnimationValueInput =
  | number | CGPointLike | CGSizeLike | CGRectLike | ColorValue | UIBezierPath;

/**
 * 事务。它管的是**隐式动画**：在 UIKit 的动画块外面改独立子图层的属性，
 * Core Animation 默认会给一个 0.25 秒的动画。
 *
 * ```js
 * CATransaction.begin();
 * CATransaction.setDisableActions(true);
 * shape.strokeEnd = 1;        // 立刻生效，不动画
 * CATransaction.commit();
 * ```
 *
 * 全是类方法，没有实例，所以不可构造。
 */
declare class CATransaction {
  private constructor();
  static begin(): void;
  /** 没有 `begin` 就 `commit` 会抛。 */
  static commit(): void;
  static flush(): void;
  static disableActions(): boolean;
  /** 关掉隐式动画。只在当前事务里有效。 */
  static setDisableActions(value: boolean): void;
  static animationDuration(): number;
  static setAnimationDuration(value: number): void;
  static animationTimingFunction(): CAMediaTimingFunction | null;
  static setAnimationTimingFunction(value: CAMediaTimingFunction | null): void;
}
