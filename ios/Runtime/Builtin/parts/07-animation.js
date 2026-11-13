// 动画：CAAnimation 一家
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    POINT_FIELDS,
    RECT_FIELDS,
    SIZE_FIELDS,
    constructNative,
    defineNativeClass,
    kSubscribe,
    nativeCall,
    nativeClassCall,
    nativeGet,
    nativeGetObject,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    nativeSetObjectArray,
    nativeSetOwned,
    ownAll,
    ownedValue,
    requireNative,
    shellOnly,
    structArg,
    subscribeNative,
    toBoolean,
    toInteger,
    toNumber,
    toNumbersOrNull,
    toPoint,
    toRect,
    toSize,
  } = ctx;

  // 这几个定义在后面的 part 里，转发一道（原文整个是一个 IIFE，靠函数提升）
  const colorArg = (...a) => ctx.colorArg(...a);
  const colorString = (...a) => ctx.colorString(...a);

  defineNativeClass('CAMediaTimingFunction', class CAMediaTimingFunction extends NSObject {
    constructor() { nativeOnly(new.target); }

    static functionWithName(name) {
      return nativeClassCall('CAMediaTimingFunction', 'functionWithName:', [name]);
    }
    static functionWithControlPoints(c1x, c1y, c2x, c2y) {
      return nativeClassCall('CAMediaTimingFunction', 'functionWithControlPoints:',
                             [toNumber(c1x, 'c1x'), toNumber(c1y, 'c1y'),
                              toNumber(c2x, 'c2x'), toNumber(c2y, 'c2y')]);
    }
    // ObjC 那边是出参（float[2]），这里改成返回一个点。0 和 3 是端点
    // （永远是 (0,0) 和 (1,1)），1 和 2 才是控制点
    controlPointAtIndex(index) {
      return toPoint(nativeCall(this, 'controlPointAtIndex:', [toInteger(index, 'index')]));
    }
  });

  // 动画的基类。不可直接构造——ObjC 的 +animation 能建，但一个没有
  // keyPath 的动画什么都做不了，没有理由给出来。
  //
  // 它是 EventTarget：'start' 和 'stop' 两个事件来自 CAAnimationDelegate。
  // stop 事件带一个 finished——**那个事实在动画对象上读不出来**，所以
  // 必须带在事件上（事件带不带数据的判据就是这个）。
  const CAAnimation = defineNativeClass('CAAnimation', class CAAnimation extends NSObject {
    constructor() { shellOnly(new.target, CAAnimation, 'CAAnimation'); super(); }

    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // ---- 时间（来自 CAMediaTiming） ----
    // 秒。**0 不是「不动画」**：加到图层上时 0 会被换成当前事务的
    // animationDuration，没有的话是 0.25 秒
    get duration() { requireNative(this, 'duration'); return nativeGet(this, 'duration'); }
    set duration(value) { requireNative(this, 'duration'); nativeSet(this, 'duration', toNumber(value, 'duration')); }
    // 相对于父级时间轴的开始时刻。默认 0 = 立刻
    get beginTime() { requireNative(this, 'beginTime'); return nativeGet(this, 'beginTime'); }
    set beginTime(value) { requireNative(this, 'beginTime'); nativeSet(this, 'beginTime', toNumber(value, 'beginTime')); }
    // 时间流速。2 是两倍快，0 是停住。默认 1
    get speed() { requireNative(this, 'speed'); return nativeGet(this, 'speed'); }
    set speed(value) { requireNative(this, 'speed'); nativeSet(this, 'speed', toNumber(value, 'speed')); }
    get timeOffset() { requireNative(this, 'timeOffset'); return nativeGet(this, 'timeOffset'); }
    set timeOffset(value) { requireNative(this, 'timeOffset'); nativeSet(this, 'timeOffset', toNumber(value, 'timeOffset')); }
    // 重复几次。可以是小数（1.5 = 跑一遍半）。要无限循环用 Infinity。
    //
    // **JSON 没有 Infinity**（JSON.stringify 给的是 null），所以它在桥上
    // 是字符串 'infinity'，两头各换一次。JS 看到的类型还是 number
    get repeatCount() {
      requireNative(this, 'repeatCount');
      return infinityIn(nativeGet(this, 'repeatCount'));
    }
    set repeatCount(value) {
      requireNative(this, 'repeatCount');
      nativeSet(this, 'repeatCount', infinityOut(value, 'repeatCount'));
    }
    get repeatDuration() {
      requireNative(this, 'repeatDuration');
      return infinityIn(nativeGet(this, 'repeatDuration'));
    }
    set repeatDuration(value) {
      requireNative(this, 'repeatDuration');
      nativeSet(this, 'repeatDuration', infinityOut(value, 'repeatDuration'));
    }
    // 跑完再倒着跑回来。配 repeatCount 做脉动
    get autoreverses() { requireNative(this, 'autoreverses'); return nativeGet(this, 'autoreverses'); }
    set autoreverses(value) { requireNative(this, 'autoreverses'); nativeSet(this, 'autoreverses', toBoolean(value)); }
    // 动画的活动区间之外，属性显示成什么。默认 'removed'
    get fillMode() { requireNative(this, 'fillMode'); return nativeGet(this, 'fillMode'); }
    set fillMode(value) { requireNative(this, 'fillMode'); nativeSet(this, 'fillMode', value); }

    // ---- 曲线和收尾 ----
    get timingFunction() { return nativeGetOwned(this, 'timingFunction'); }
    set timingFunction(value) { nativeSetOwned(this, 'timingFunction', value); }
    // 默认 true：跑完就把动画摘掉，属性**弹回模型值**。这是最常被当成
    // bug 的行为——正确的做法是在加动画的同时把模型值也设成终点值
    get removedOnCompletion() {
      requireNative(this, 'removedOnCompletion');
      return nativeGet(this, 'removedOnCompletion');
    }
    set removedOnCompletion(value) {
      requireNative(this, 'removedOnCompletion');
      nativeSet(this, 'removedOnCompletion', toBoolean(value));
    }
  });

  // 动画某一个属性。自己不可构造，用 CABasicAnimation。
  const CAPropertyAnimation = defineNativeClass('CAPropertyAnimation',
                                                class CAPropertyAnimation extends CAAnimation {
    constructor() {
      shellOnly(new.target, CAPropertyAnimation, 'CAPropertyAnimation');
      super();
    }

    // 动哪个属性。只认运行时认得动画的那些名字，写别的当场抛并列出全表
    get keyPath() { requireNative(this, 'keyPath'); return nativeGet(this, 'keyPath'); }
    set keyPath(value) { requireNative(this, 'keyPath'); nativeSet(this, 'keyPath', value); }
  });

  // 从一个值走到另一个值。
  //
  // fromValue / toValue / byValue 该放什么类型**由 keyPath 决定**：
  // 'opacity' 要数字，'position' 要 CGPoint，'strokeColor' 要颜色，
  // 'path' 要 UIBezierPath。所以要**先设 keyPath**，否则赋值时抛。
  const CABasicAnimation = defineNativeClass('CABasicAnimation', class CABasicAnimation extends CAPropertyAnimation {
    constructor() {
      super();
      constructNative(this, new.target, 'CABasicAnimation', []);
    }

    // 常用写法：一步建好并带上 keyPath
    static animationWithKeyPath(keyPath) {
      return nativeClassCall('CABasicAnimation', 'animationWithKeyPath:', [keyPath]);
    }

    // 三个取值器都把 nativeGet / nativeSet 的名字**写成字面量**，不抽进
    // 助手里——check-api.sh 靠正则认这些名字，抽进去它就看不见了。
    // 和枚举表不抽宏是同一条取舍：能被检查看见比少写几行重要
    get fromValue() {
      const object = nativeGetObject(this, 'fromValue');
      return object === null ? animScalarOut(nativeGet(this, 'fromValue'))
                             : animObjectOut(object);
    }
    set fromValue(value) {
      if (value === null || value === undefined) {
        nativeSetOwned(this, 'fromValue', null);
        nativeSet(this, 'fromValue', null);
        return;
      }
      const object = animObjectIn(value, 'fromValue');
      if (object === null) return;             // 颜色写错了，警告过了
      if (object !== undefined) { nativeSetOwned(this, 'fromValue', object); return; }
      nativeSet(this, 'fromValue', animScalarIn(value, 'fromValue'));
    }
    get toValue() {
      const object = nativeGetObject(this, 'toValue');
      return object === null ? animScalarOut(nativeGet(this, 'toValue'))
                             : animObjectOut(object);
    }
    set toValue(value) {
      if (value === null || value === undefined) {
        nativeSetOwned(this, 'toValue', null);
        nativeSet(this, 'toValue', null);
        return;
      }
      const object = animObjectIn(value, 'toValue');
      if (object === null) return;
      if (object !== undefined) { nativeSetOwned(this, 'toValue', object); return; }
      nativeSet(this, 'toValue', animScalarIn(value, 'toValue'));
    }
    // 相对量：toValue = fromValue + byValue
    get byValue() {
      const object = nativeGetObject(this, 'byValue');
      return object === null ? animScalarOut(nativeGet(this, 'byValue'))
                             : animObjectOut(object);
    }
    set byValue(value) {
      if (value === null || value === undefined) {
        nativeSetOwned(this, 'byValue', null);
        nativeSet(this, 'byValue', null);
        return;
      }
      const object = animObjectIn(value, 'byValue');
      if (object === null) return;
      if (object !== undefined) { nativeSetOwned(this, 'byValue', object); return; }
      nativeSet(this, 'byValue', animScalarIn(value, 'byValue'));
    }
  });

  // 多个关键帧，或者沿一条路径走。
  //
  // values 和 CABasicAnimation 的 toValue 一样，类型由 keyPath 决定，
  // 所以同样要**先设 keyPath**。给了 path 之后 values 就不起作用了。
  defineNativeClass('CAKeyframeAnimation',
                    class CAKeyframeAnimation extends CAPropertyAnimation {
    constructor() {
      super();
      constructNative(this, new.target, 'CAKeyframeAnimation', []);
    }
    static animationWithKeyPath(keyPath) {
      return nativeClassCall('CAKeyframeAnimation', 'animationWithKeyPath:', [keyPath]);
    }

    // 一串关键帧值。颜色和路径走对象数组通道，数字和结构体走标量通道——
    // 和 toValue 一个分工：JS 看形状挑通道，原生按 keyPath 核类型
    get values() {
      const objects = nativeGetObjectArray(this, 'values');
      if (objects.length > 0) return ownAll(this, 'values', objects).map(animObjectOut);
      const list = nativeGet(this, 'values');
      return list === null ? null : list.map(animScalarOut);
    }
    set values(value) {
      if (value === null || value === undefined) {
        nativeSet(this, 'values', null);
        return;
      }
      const list = Array.from(value);
      const first = list.length > 0 ? list[0] : undefined;
      if (typeof first === 'string' || first instanceof UIColor ||
          first instanceof UIBezierPath) {
        const objects = [];
        for (const item of list) {
          const object = animObjectIn(item, 'values');
          if (object === null || object === undefined) return;  // 不合法，警告过了
          objects.push(object);
        }
        nativeSetObjectArray(this, 'values', objects);
        ownAll(this, 'values', objects);
        return;
      }
      nativeSet(this, 'values', list.map((item) => animScalarIn(item, 'values')));
    }

    // 沿着这条路径走。**给了它 values 就作废**（头文件原话）。
    // 和 CAShapeLayer.path 一样：写进去的那个对象原样还回来
    get path() {
      const mine = ownedValue(this, 'path');
      return mine === undefined ? nativeGetObject(this, 'path') : mine;
    }
    set path(value) { nativeSetOwned(this, 'path', value); }

    // 每帧落在 0…1 的哪一处。null 是均匀分布
    get keyTimes() { requireNative(this, 'keyTimes'); return nativeGet(this, 'keyTimes'); }
    set keyTimes(value) { requireNative(this, 'keyTimes'); nativeSet(this, 'keyTimes', toNumbersOrNull(value, 'keyTimes')); }
    // 每**段**一条曲线，所以个数是 values.length - 1
    get timingFunctions() {
      return ownAll(this, 'timingFunctions', nativeGetObjectArray(this, 'timingFunctions'));
    }
    set timingFunctions(value) {
      const list = Array.from(value || []);
      nativeSetObjectArray(this, 'timingFunctions', list);
      ownAll(this, 'timingFunctions', list);
    }
    // 'linear'（默认）/ 'discrete' / 'paced' / 'cubic' / 'cubicPaced'。
    // paced 和 cubicPaced 会**忽略 keyTimes 和 timingFunctions**
    get calculationMode() {
      requireNative(this, 'calculationMode');
      return nativeGet(this, 'calculationMode');
    }
    set calculationMode(value) {
      requireNative(this, 'calculationMode');
      nativeSet(this, 'calculationMode', value);
    }
    // 沿路径走时跟不跟着切线转。默认 null = 不转，**只在给了 path 时有意义**
    get rotationMode() {
      requireNative(this, 'rotationMode');
      return nativeGet(this, 'rotationMode');
    }
    set rotationMode(value) {
      requireNative(this, 'rotationMode');
      nativeSet(this, 'rotationMode', value);
    }
    // 下面三个只有 cubic / cubicPaced 用得上（Kochanek-Bartels 样条），
    // 每个值在 -1…1。没给的按 0 算，全不给就是 Catmull-Rom
    get tensionValues() {
      requireNative(this, 'tensionValues');
      return nativeGet(this, 'tensionValues');
    }
    set tensionValues(value) {
      requireNative(this, 'tensionValues');
      nativeSet(this, 'tensionValues', toNumbersOrNull(value, 'tensionValues'));
    }
    get continuityValues() {
      requireNative(this, 'continuityValues');
      return nativeGet(this, 'continuityValues');
    }
    set continuityValues(value) {
      requireNative(this, 'continuityValues');
      nativeSet(this, 'continuityValues', toNumbersOrNull(value, 'continuityValues'));
    }
    get biasValues() { requireNative(this, 'biasValues'); return nativeGet(this, 'biasValues'); }
    set biasValues(value) { requireNative(this, 'biasValues'); nativeSet(this, 'biasValues', toNumbersOrNull(value, 'biasValues')); }
  });

  // 弹簧。它是 CABasicAnimation 的子类，所以 fromValue / toValue 照用，
  // 只是**走过去的方式**由四个物理参数决定，不由 duration 和曲线决定。
  //
  // iOS 17 的 initWithPerceptualDuration:bounce: 还没做：构造通道只传
  // 对象句柄，传不了标量。perceptualDuration 和 bounce 读得出来，
  // 是系统按当前参数反算的。
  defineNativeClass('CASpringAnimation', class CASpringAnimation extends CABasicAnimation {
    constructor() {
      super();
      constructNative(this, new.target, 'CASpringAnimation', []);
    }
    static animationWithKeyPath(keyPath) {
      return nativeClassCall('CASpringAnimation', 'animationWithKeyPath:', [keyPath]);
    }

    // 挂在弹簧末端的质量，要大于 0。默认 1。越大越沉、晃得越久
    get mass() { requireNative(this, 'mass'); return nativeGet(this, 'mass'); }
    set mass(value) { requireNative(this, 'mass'); nativeSet(this, 'mass', toNumber(value, 'mass')); }
    // 劲度系数，要大于 0。默认 100。越大越快
    get stiffness() { requireNative(this, 'stiffness'); return nativeGet(this, 'stiffness'); }
    set stiffness(value) { requireNative(this, 'stiffness'); nativeSet(this, 'stiffness', toNumber(value, 'stiffness')); }
    // 阻尼，要 >= 0。默认 10。越大越不晃，够大就直接停住不回弹
    get damping() { requireNative(this, 'damping'); return nativeGet(this, 'damping'); }
    set damping(value) { requireNative(this, 'damping'); nativeSet(this, 'damping', toNumber(value, 'damping')); }
    // 初速度。默认 0 = 静止。正值朝着终点冲，负值反着来
    get initialVelocity() {
      requireNative(this, 'initialVelocity');
      return nativeGet(this, 'initialVelocity');
    }
    set initialVelocity(value) {
      requireNative(this, 'initialVelocity');
      nativeSet(this, 'initialVelocity', toNumber(value, 'initialVelocity'));
    }
    // 允不允许真正的过阻尼。默认 false，那时过阻尼被当成临界阻尼
    get allowsOverdamping() {
      requireNative(this, 'allowsOverdamping');
      return nativeGet(this, 'allowsOverdamping');
    }
    set allowsOverdamping(value) {
      requireNative(this, 'allowsOverdamping');
      nativeSet(this, 'allowsOverdamping', toBoolean(value));
    }

    // 下面三个只读，系统按当前四个参数算出来的。
    // **duration 对弹簧不起作用**，要知道多久停下来看 settlingDuration
    get settlingDuration() {
      requireNative(this, 'settlingDuration');
      return nativeGet(this, 'settlingDuration');
    }
    get perceptualDuration() {
      requireNative(this, 'perceptualDuration');
      return nativeGet(this, 'perceptualDuration');
    }
    get bounce() { requireNative(this, 'bounce'); return nativeGet(this, 'bounce'); }
  });

  // 一组动画一起跑。组自己的 duration / repeatCount 管整组，
  // 成员的时间都落在组的时间轴里。
  defineNativeClass('CAAnimationGroup', class CAAnimationGroup extends CAAnimation {
    constructor() {
      super();
      constructNative(this, new.target, 'CAAnimationGroup', []);
    }

    // 原生侧 group 持有这些动画，JS 侧也要有对应的一条边，
    // 否则 JS 丢掉引用后包装会被 GC，再读回来挂的监听器就没了
    get animations() {
      return ownAll(this, 'animations', nativeGetObjectArray(this, 'animations'));
    }
    set animations(value) {
      const list = Array.from(value || []);
      nativeSetObjectArray(this, 'animations', list);
      ownAll(this, 'animations', list);
    }
  });

  // JSON 带不动 Infinity，所以过桥时换成一个字符串。负无穷不处理：
  // 这两个属性都是「次数」和「时长」，负的没有意义
  const infinityIn = (value) => (value === 'infinity' ? Infinity : value);
  const infinityOut = (value, what) => (value === Infinity ? 'infinity' : toNumber(value, what));

  // 值走哪条通道，由**值的形状**决定（这件事 JS 自己知道）；
  // 值配不配得上 keyPath，由**原生层**判断（只有它知道那张表）。

  // 对象通道读回来的：颜色给字符串，路径原样给
  function animObjectOut(object) {
    return object instanceof UIColor ? colorString(object) : object;
  }
  // 标量通道读回来的：数字原样，结构体按字段认是哪一种
  function animScalarOut(value) {
    if (value === null || typeof value === 'number') return value;
    if ('width' in value) return 'x' in value ? toRect(value) : toSize(value);
    return toPoint(value);
  }
  // 写进去的值该不该走对象通道。undefined = 不该，null = 不合法（已警告）
  function animObjectIn(value, what) {
    if (value instanceof UIBezierPath) return value;
    if (typeof value !== 'string' && !(value instanceof UIColor)) return undefined;
    const color = colorArg(value, what);
    return color === undefined ? null : color;
  }
  // 结构体参数：按字段认，不用调用方说是哪种。原生那边还会再按 keyPath 核一遍
  function animScalarIn(value, what) {
    if (typeof value === 'number') return value;
    if (value != null && typeof value === 'object') {
      if ('width' in value) {
        return 'x' in value ? structArg(value, RECT_FIELDS, what)
                            : structArg(value, SIZE_FIELDS, what);
      }
      if ('x' in value) return structArg(value, POINT_FIELDS, what);
    }
    throw new TypeError(
      what + ' needs a number, a CGPoint / CGSize / CGRect, a color, or a UIBezierPath');
  }

  // run loop。只给 mainRunLoop 一个：JS 跑在主线程，currentRunLoop 永远
  // 等于它。暴露它是因为 CADisplayLink.addToRunLoop 躲不开这个参数。

})
