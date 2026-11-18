// 设备、运行循环、触感反馈、剪贴板、帧回调
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    FRAME_RATE_FIELDS,
    constructNative,
    defineNativeClass,
    disown,
    finalCheck,
    has,
    kSubscribe,
    nativeCall,
    nativeClassCall,
    nativeClassNames,
    nativeClassObject,
    nativeGet,
    nativeOnly,
    nativeSet,
    own,
    ownOne,
    requireNative,
    structArg,
    subscribeNative,
    toBoolean,
    toFrameRateRange,
    toNumber,
    toTextOrNull,
  } = ctx;

  defineNativeClass('NSRunLoop', class NSRunLoop extends NSObject {
    constructor() { nativeOnly(new.target); }
    // 系统的单例一直活着，所以由类自己拿着它的包装。display link 的持有边
    // 就挂在这个包装上，它得是一个固定的根
    static get mainRunLoop() {
      return own(this, 'mainRunLoop', nativeClassObject('NSRunLoop', 'mainRunLoop'));
    }
  });

  // 这台设备。只有类级的单例 currentDevice，全部只读。
  //
  // 现在只有不会变的那几项。电量、设备朝向、距离感应带变化通知，另起一步
  defineNativeClass('UIDevice', class UIDevice extends NSObject {
    constructor() { nativeOnly(new.target); }
    static get currentDevice() { return nativeClassObject('UIDevice', 'currentDevice'); }

    // 拿不到用户给设备起的名字（iOS 16 起）。头文件说它是 model 的同义词：
    // 真机上属实（都是 iPhone），模拟器上是模拟器的名字（iPhone Air）
    get name() { requireNative(this, 'name'); return nativeGet(this, 'name'); }
    get model() { requireNative(this, 'model'); return nativeGet(this, 'model'); }
    get localizedModel() {
      requireNative(this, 'localizedModel');
      return nativeGet(this, 'localizedModel');
    }
    get systemName() { requireNative(this, 'systemName'); return nativeGet(this, 'systemName'); }
    // 字符串，形如 '26.1'。要比大小先拆开转成数，别直接比字符串
    get systemVersion() {
      requireNative(this, 'systemVersion');
      return nativeGet(this, 'systemVersion');
    }
    get userInterfaceIdiom() {
      requireNative(this, 'userInterfaceIdiom');
      return nativeGet(this, 'userInterfaceIdiom');
    }
    // 同一个开发者的 App 在这台设备上共用的 UUID。App 全卸掉再装会变
    get identifierForVendor() {
      requireNative(this, 'identifierForVendor');
      return nativeGet(this, 'identifierForVendor');
    }
  });

  // ---- 触感反馈 ----
  //
  // 让手机震一下。三种：撞击（按钮按下、东西落位）、选择（滚轮换了一格）、
  // 通知（成功 / 警告 / 失败）。
  //
  // **没有 new**。ObjC 的 -init 在头文件里已经标成将废弃，替代品是和视图
  // 绑定的工厂方法，这里只给后者。
  function noFeedbackInit(newTarget, hint) {
    finalCheck(newTarget);   // 是子类化就先报子类化
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') +
      ' has no public initializer; use ' + hint);
  }
  const UIFeedbackGenerator = defineNativeClass('UIFeedbackGenerator',
                                                class UIFeedbackGenerator extends NSObject {
    constructor() {
      noFeedbackInit(new.target, 'one of its subclasses, e.g. ' +
        'UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })');
    }
    // 提前让触感引擎就绪。马上就要触发时先调它，延迟更小
    prepare() { nativeCall(this, 'prepare', []); }
  });

  defineNativeClass('UIImpactFeedbackGenerator',
                    class UIImpactFeedbackGenerator extends UIFeedbackGenerator {
    constructor() {
      noFeedbackInit(new.target,
        'UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })');
    }
    static feedbackGeneratorWithStyle(style, options) {
      const o = options || {};
      if (!(has(o, 'forView'))) {
        throw new TypeError('feedbackGeneratorWithStyle needs { forView }');
      }
      return nativeClassCall('UIImpactFeedbackGenerator',
                             'feedbackGeneratorWithStyle:forView:', [style, o.forView]);
    }
    impactOccurred() { nativeCall(this, 'impactOccurred', []); }
    // 0 到 1，1 是这种力度的满强度
    impactOccurredWithIntensity(intensity) {
      nativeCall(this, 'impactOccurredWithIntensity:', [toNumber(intensity, 'intensity')]);
    }
  });

  defineNativeClass('UISelectionFeedbackGenerator',
                    class UISelectionFeedbackGenerator extends UIFeedbackGenerator {
    constructor() {
      noFeedbackInit(new.target, 'UISelectionFeedbackGenerator.feedbackGeneratorForView(view)');
    }
    static feedbackGeneratorForView(view) {
      return nativeClassCall('UISelectionFeedbackGenerator', 'feedbackGeneratorForView:', [view]);
    }
    selectionChanged() { nativeCall(this, 'selectionChanged', []); }
  });

  defineNativeClass('UINotificationFeedbackGenerator',
                    class UINotificationFeedbackGenerator extends UIFeedbackGenerator {
    constructor() {
      noFeedbackInit(new.target,
        'UINotificationFeedbackGenerator.feedbackGeneratorForView(view)');
    }
    static feedbackGeneratorForView(view) {
      return nativeClassCall('UINotificationFeedbackGenerator', 'feedbackGeneratorForView:',
                             [view]);
    }
    notificationOccurred(type) { nativeCall(this, 'notificationOccurred:', [type]); }
  });

  // 系统剪贴板。只有类级的单例 generalPasteboard，现在只管字符串。
  //
  // 读 string 是真的去取内容——内容来自别的 App 时系统可能先问用户，
  // 所以另外给了两个不取内容的查询：hasStrings 和 changeCount
  defineNativeClass('UIPasteboard', class UIPasteboard extends NSObject {
    constructor() { nativeOnly(new.target); }
    // 系统的单例一直活着，所以由类自己拿着它的包装
    static get generalPasteboard() {
      return own(this, 'generalPasteboard',
                 nativeClassObject('UIPasteboard', 'generalPasteboard'));
    }

    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    get string() { requireNative(this, 'string'); return nativeGet(this, 'string'); }
    set string(value) { requireNative(this, 'string'); nativeSet(this, 'string', toTextOrNull(value)); }
    get hasStrings() { requireNative(this, 'hasStrings'); return nativeGet(this, 'hasStrings'); }
    get changeCount() {
      requireNative(this, 'changeCount');
      return nativeGet(this, 'changeCount');
    }
  });

  // 和屏幕刷新同步的回调。
  //
  // ```js
  // const link = new CADisplayLink();
  // link.addEventListener('tick', (e) => { box.layer.position = next(e.frame); });
  // link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
  // …
  // link.invalidate();
  // ```
  //
  // **两道闸都要开**：挂了监听器，还要 addToRunLoop，少一个都不发。
  //
  // ObjC 那边是 +displayLinkWithTarget:selector:，而 target / selector 在 JS
  // 里没有对应物，所以运行时自己当 target，JS 侧只看到事件——和控件事件
  // 一个做法。
  //
  // 日常动画**优先用 animate / CAAnimation**：那些跑在 render server 里，
  // 主线程卡住照样走；display link 驱动的每帧都要 JS，主线程一忙就掉帧。
  // link -> { runLoop, modes }：它现在在哪个 run loop 的哪几个模式上
  const linkRunLoops = new WeakMap();

  defineNativeClass('CADisplayLink', class CADisplayLink extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'CADisplayLink', []);
    }

    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // 'default' 只在平时跑，**滚动时会停**；'common' 滚动时也跑。
    // 这是 display link 最常见的坑
    // 持有边的方向照原生：**run loop 拿着 link**，不是反过来。加进去之后
    // JS 这边一个引用都不留，link 也要活着——系统会一直叫它。
    // 系统不告诉我们一个 link 现在在哪几个模式上，所以自己记着：最后一个
    // 模式摘掉，或者 invalidate，才放开
    addToRunLoop(runLoop, options) {
      const o = options || {};
      const mode = has(o, 'forMode') ? o.forMode : 'default';
      nativeCall(this, 'addToRunLoop:forMode:', [runLoop, mode]);
      let held = linkRunLoops.get(this);
      if (held === undefined) linkRunLoops.set(this, (held = { runLoop, modes: new Set() }));
      held.modes.add(String(mode));
      ownOne(runLoop, 'displayLinks', this);
    }
    removeFromRunLoop(runLoop, options) {
      const o = options || {};
      const mode = has(o, 'forMode') ? o.forMode : 'default';
      nativeCall(this, 'removeFromRunLoop:forMode:', [runLoop, mode]);
      const held = linkRunLoops.get(this);
      if (held === undefined) return;
      held.modes.delete(String(mode));
      if (held.modes.size === 0) {
        disown(runLoop, 'displayLinks', this);
        linkRunLoops.delete(this);
      }
    }
    // 从所有模式里摘掉。摘完就再也启动不了，要新的就再 new 一个
    invalidate() {
      nativeCall(this, 'invalidate', []);
      const held = linkRunLoops.get(this);
      if (held === undefined) return;
      disown(held.runLoop, 'displayLinks', this);
      linkRunLoops.delete(this);
    }

    // 下面三个都是**秒**，和 ObjC 一致。基准是设备启动，不是 Date.now()，
    // 只能拿来算差值
    get timestamp() { requireNative(this, 'timestamp'); return nativeGet(this, 'timestamp'); }
    get duration() { requireNative(this, 'duration'); return nativeGet(this, 'duration'); }
    // 该为哪一帧渲染。做预测用这个，不是 timestamp
    get targetTimestamp() {
      requireNative(this, 'targetTimestamp');
      return nativeGet(this, 'targetTimestamp');
    }
    // 暂停不等于摘掉：还挂在 run loop 上，设回 false 就继续
    get isPaused() { requireNative(this, 'isPaused'); return nativeGet(this, 'isPaused'); }
    set isPaused(value) { requireNative(this, 'isPaused'); nativeSet(this, 'isPaused', toBoolean(value)); }
    // 想要多少帧率。默认三个 0 = 跟硬件走
    get preferredFrameRateRange() {
      requireNative(this, 'preferredFrameRateRange');
      return toFrameRateRange(nativeGet(this, 'preferredFrameRateRange'));
    }
    set preferredFrameRateRange(value) {
      requireNative(this, 'preferredFrameRateRange');
      nativeSet(this, 'preferredFrameRateRange',
                structArg(value, FRAME_RATE_FIELDS, 'preferredFrameRateRange'));
    }
  });

  // 事务。它管的是**隐式动画**：在 UIKit 的动画块外面改独立子图层的属性，
  // Core Animation 默认给一个 0.25 秒的动画。setDisableActions 是关掉它的
  // 唯一办法，begin / commit 成对出现。
  //
  // 全是类方法，没有实例，所以不给构造。

})
