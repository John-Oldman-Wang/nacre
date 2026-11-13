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

/**
 * 多个关键帧，或者沿一条路径走。
 *
 * ```js
 * const walk = CAKeyframeAnimation.animationWithKeyPath('position');
 * walk.path = trail;                 // 一条 UIBezierPath
 * walk.rotationMode = 'auto';        // 跟着切线转
 * walk.calculationMode = 'paced';    // 匀速
 * walk.duration = 3;
 * dot.addAnimation(walk, { forKey: 'walk' });
 * ```
 *
 * `values` 和 `CABasicAnimation.toValue` 一样，类型由 `keyPath` 决定，
 * 所以同样**要先设 `keyPath`**。
 */
declare class CAKeyframeAnimation extends CAPropertyAnimation {
  constructor();
  static animationWithKeyPath(keyPath: CAAnimationKeyPath): CAKeyframeAnimation;

  /** 一串关键帧值。具体要哪一种由 `keyPath` 决定。 */
  get values(): CAAnimationValue[] | null;
  set values(value: CAAnimationValueInput[] | null);
  /**
   * 沿着这条路径走。**给了它 `values` 就作废**。
   *
   * 和 `CAShapeLayer.path` 一样：写进去的那个对象原样还回来，存的是副本。
   */
  get path(): UIBezierPath | null;
  set path(value: UIBezierPath | null);
  /** 每帧落在 0…1 的哪一处，个数要和 `values` 对上。`null` 是均匀分布。 */
  keyTimes: number[] | null;
  /** 每**段**一条曲线，所以个数是 `values.length - 1`。 */
  timingFunctions: CAMediaTimingFunction[];
  /** 默认 `'linear'`。 */
  calculationMode: CAAnimationCalculationMode;
  /** 默认 `null` = 不转。只在给了 `path` 时有意义。 */
  rotationMode: CAAnimationRotationMode | null;
  /** 只有 `cubic` / `cubicPaced` 用得上，每个值在 -1…1。全不给就是 Catmull-Rom。 */
  tensionValues: number[] | null;
  continuityValues: number[] | null;
  biasValues: number[] | null;
}

/**
 * 弹簧。`CABasicAnimation` 的子类，所以 `fromValue` / `toValue` 照用，
 * 只是**走过去的方式**由四个物理参数决定。
 *
 * **`duration` 对它不起作用**——要知道多久停下来看 `settlingDuration`。
 *
 * iOS 17 的 `initWithPerceptualDuration:bounce:` 还没做：构造通道只传对象
 * 句柄，传不了标量。`perceptualDuration` 和 `bounce` 读得出来，是系统按
 * 当前参数反算的。
 */
declare class CASpringAnimation extends CABasicAnimation {
  constructor();
  static animationWithKeyPath(keyPath: CAAnimationKeyPath): CASpringAnimation;

  /** 挂在弹簧末端的质量，要大于 0。默认 1。越大越沉、晃得越久。 */
  mass: number;
  /** 劲度系数，要大于 0。默认 100。越大越快。 */
  stiffness: number;
  /** 阻尼，要 >= 0。默认 10。越大越不晃，够大就不回弹。 */
  damping: number;
  /** 初速度。默认 0 = 静止。正值朝终点冲，负值反着来。 */
  initialVelocity: number;
  /** 允不允许真正的过阻尼。默认 `false`，那时过阻尼被当成临界阻尼。 */
  allowsOverdamping: boolean;

  /** 系统按当前参数估的「晃到停」要多久。 */
  readonly settlingDuration: number;
  readonly perceptualDuration: number;
  /** 0 是不回弹（临界阻尼），正值越大越弹，负值是过阻尼。 */
  readonly bounce: number;
}

/**
 * 一组动画一起跑。组自己的 `duration` / `repeatCount` 管整组，成员的时间
 * 都落在组的时间轴里。
 */
declare class CAAnimationGroup extends CAAnimation {
  constructor();
  animations: CAAnimation[];
}

/**
 * run loop。只有 `mainRunLoop` 一个——JS 跑在主线程，`currentRunLoop`
 * 永远等于它。暴露它是因为 `CADisplayLink.addToRunLoop` 躲不开这个参数。
 */
declare class NSRunLoop extends NSObject {
  private constructor();
  static readonly mainRunLoop: NSRunLoop;
}

/**
 * `CADisplayLink` 的 `tick` 事件。每帧一次。
 *
 * 和导航那几个带负载的事件一样，回调参数的类型没有窄化（`EventTarget`
 * 的基类签名不允许），要拿 `frame` 就转一下型：
 *
 * ```js
 * link.addEventListener('tick', (e) => {
 *   const frame = /** @type {CADisplayLinkEvent} *\/ (e).frame;
 * });
 * ```
 */
declare interface CADisplayLinkEvent extends Event {
  /**
   * 这一帧的时间，**单位是秒**（和 ObjC 一致）。
   *
   * 基准是设备启动，**不是 `Date.now()`**，只能拿来算差值。
   */
  readonly frame: {
    readonly timestamp: number;
    readonly duration: number;
    /** 该为哪一帧渲染。做预测用这个，不是 `timestamp`。 */
    readonly targetTimestamp: number;
  };
}

/**
 * 和屏幕刷新同步的回调。
 *
 * ```js
 * const link = new CADisplayLink();
 * link.addEventListener('tick', (e) => {
 *   box.layer.position = next(e.frame);
 * });
 * link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
 * // 不用了
 * link.invalidate();
 * ```
 *
 * **两道闸都要开**：挂了监听器，还要 `addToRunLoop`，少一个都不发。
 *
 * 日常动画**优先用 `CAAnimation`**：那些跑在 render server 里，主线程卡住
 * 照样走；display link 驱动的每帧都要 JS，主线程一忙就掉帧。它是 Core
 * Animation 表达不了时的逃生口——跟手、依赖实时数据、自定义物理。
 */
declare class CADisplayLink extends NSObject {
  constructor();
  addEventListener(
    type: 'tick',
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(type: 'tick', callback: EventListener | null): void;

  /** `forMode` 不给时是 `'default'`，那个在滚动时会停。 */
  addToRunLoop(runLoop: NSRunLoop, options?: { forMode?: NSRunLoopMode }): void;
  removeFromRunLoop(runLoop: NSRunLoop, options?: { forMode?: NSRunLoopMode }): void;
  /** 从所有模式里摘掉。摘完就再也启动不了，要新的就再 `new` 一个。 */
  invalidate(): void;

  /** 秒。基准是设备启动，不是 `Date.now()`。 */
  readonly timestamp: number;
  readonly duration: number;
  /** 该为哪一帧渲染。做预测用这个。 */
  readonly targetTimestamp: number;
  /** 暂停不等于摘掉：还挂在 run loop 上，设回 `false` 就继续。 */
  isPaused: boolean;
  /** 默认三个 0 = 跟硬件走。 */
  get preferredFrameRateRange(): CAFrameRateRange;
  set preferredFrameRateRange(value: CAFrameRateRangeLike);
}
