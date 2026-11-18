// 手势识别器
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    POINT_FIELDS,
    constructNative,
    defineNativeClass,
    has,
    kSubscribe,
    nativeCall,
    nativeGet,
    nativeGetObject,
    nativeSet,
    requireNative,
    structArg,
    subscribeNative,
    toBoolean,
    toInteger,
    toNumber,
    toPoint,
  } = ctx;

  // ---- 手势识别器 ----
  //
  // iOS 四套事件机制里「平行、抢占」的那一套。它不是视图，是**挂在视图上**的
  // 一个对象：收视图和它所有子视图上的触摸，认出某种手势时通知出来。
  //
  // ObjC 那边是 target-action，一个 action 里自己读 state。这里把状态当
  // 事件名（began / changed / ended / cancelled）——不是为了像 Web，是因为
  // 延后一轮之后 state 可能已经往前走了（手势结束的话已经重置成
  // possible），JS 回头读不到事件发生那一刻的状态。
  //
  // 点按、轻扫是**离散**手势：只发 ended（ObjC 里叫 recognized，是 ended 的别名）。
  // 长按、拖动、捏合、旋转、屏幕边缘拖动是**连续**手势：
  // began → changed* → ended / cancelled。
  const UIGestureRecognizer = defineNativeClass('UIGestureRecognizer',
                                                class UIGestureRecognizer extends NSObject {
    constructor() {
      super();
      // 基类自己什么手势都不认，ObjC 里也只是拿来继承的
      if (new.target === UIGestureRecognizer) {
        throw new TypeError(
          'Illegal constructor: UIGestureRecognizer is abstract; construct one of ' +
          'its subclasses instead: UITapGestureRecognizer, ' +
          'UILongPressGestureRecognizer, UIPanGestureRecognizer, ' +
          'UIPinchGestureRecognizer, UIRotationGestureRecognizer, ' +
          'UISwipeGestureRecognizer, UIScreenEdgePanGestureRecognizer');
      }
    }

    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // 回调里读它，读到的是**回调执行那一刻**的状态，不是事件发生那一刻的。
    // 实测：点按的 ended 回调里是 possible（识别器已经重置），长按的 began
    // 回调里手指还按着时是 began。要知道是哪个阶段，看事件名
    get state() { requireNative(this, 'state'); return nativeGet(this, 'state'); }
    // 挂在哪个视图上。回边，不是持有
    get view() {
      requireNative(this, 'view');
      return nativeGetObject(this, 'view');
    }
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) { requireNative(this, 'isEnabled'); nativeSet(this, 'isEnabled', toBoolean(value)); }
    // 认出手势之后，要不要给视图发 touchesCancelled。默认 true
    get cancelsTouchesInView() {
      requireNative(this, 'cancelsTouchesInView');
      return nativeGet(this, 'cancelsTouchesInView');
    }
    set cancelsTouchesInView(value) {
      requireNative(this, 'cancelsTouchesInView');
      nativeSet(this, 'cancelsTouchesInView', toBoolean(value));
    }
    get delaysTouchesBegan() {
      requireNative(this, 'delaysTouchesBegan');
      return nativeGet(this, 'delaysTouchesBegan');
    }
    set delaysTouchesBegan(value) {
      requireNative(this, 'delaysTouchesBegan');
      nativeSet(this, 'delaysTouchesBegan', toBoolean(value));
    }
    get delaysTouchesEnded() {
      requireNative(this, 'delaysTouchesEnded');
      return nativeGet(this, 'delaysTouchesEnded');
    }
    set delaysTouchesEnded(value) {
      requireNative(this, 'delaysTouchesEnded');
      nativeSet(this, 'delaysTouchesEnded', toBoolean(value));
    }
    get numberOfTouches() {
      requireNative(this, 'numberOfTouches');
      return nativeGet(this, 'numberOfTouches');
    }
    // 另一个识别器确定认不出之后，这一个才认。典型用法：单击等双击失败。
    // 不记所有权边：实测 UIKit 两边都不持有对方，建了关系之后放掉任何一个，
    // 它都当场释放。两个识别器各自由它所在的视图持有
    requireGestureRecognizerToFail(otherGestureRecognizer) {
      nativeCall(this, 'requireGestureRecognizerToFail:', [otherGestureRecognizer]);
    }
  });

  defineNativeClass('UITapGestureRecognizer',
                    class UITapGestureRecognizer extends UIGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UITapGestureRecognizer', []);
    }
    // 要点几下才算。默认 1；2 就是双击
    get numberOfTapsRequired() {
      requireNative(this, 'numberOfTapsRequired');
      return nativeGet(this, 'numberOfTapsRequired');
    }
    set numberOfTapsRequired(value) {
      requireNative(this, 'numberOfTapsRequired');
      nativeSet(this, 'numberOfTapsRequired', toInteger(value, 'numberOfTapsRequired'));
    }
    // 要几根手指。默认 1
    get numberOfTouchesRequired() {
      requireNative(this, 'numberOfTouchesRequired');
      return nativeGet(this, 'numberOfTouchesRequired');
    }
    set numberOfTouchesRequired(value) {
      requireNative(this, 'numberOfTouchesRequired');
      nativeSet(this, 'numberOfTouchesRequired', toInteger(value, 'numberOfTouchesRequired'));
    }
  });

  defineNativeClass('UILongPressGestureRecognizer',
                    class UILongPressGestureRecognizer extends UIGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UILongPressGestureRecognizer', []);
    }
    // 按住多久才算，**秒**。默认 0.5
    get minimumPressDuration() {
      requireNative(this, 'minimumPressDuration');
      return nativeGet(this, 'minimumPressDuration');
    }
    set minimumPressDuration(value) {
      requireNative(this, 'minimumPressDuration');
      nativeSet(this, 'minimumPressDuration', toNumber(value, 'minimumPressDuration'));
    }
    // 认出来之前手指最多能挪多远，点。默认 10。认出来之后不限
    get allowableMovement() {
      requireNative(this, 'allowableMovement');
      return nativeGet(this, 'allowableMovement');
    }
    set allowableMovement(value) {
      requireNative(this, 'allowableMovement');
      nativeSet(this, 'allowableMovement', toNumber(value, 'allowableMovement'));
    }
    // 按住之前要先完整点几下。默认 0
    get numberOfTapsRequired() {
      requireNative(this, 'numberOfTapsRequired');
      return nativeGet(this, 'numberOfTapsRequired');
    }
    set numberOfTapsRequired(value) {
      requireNative(this, 'numberOfTapsRequired');
      nativeSet(this, 'numberOfTapsRequired', toInteger(value, 'numberOfTapsRequired'));
    }
    get numberOfTouchesRequired() {
      requireNative(this, 'numberOfTouchesRequired');
      return nativeGet(this, 'numberOfTouchesRequired');
    }
    set numberOfTouchesRequired(value) {
      requireNative(this, 'numberOfTouchesRequired');
      nativeSet(this, 'numberOfTouchesRequired', toInteger(value, 'numberOfTouchesRequired'));
    }
  });

  // 拖动。连续手势：手指移动够远时 began，之后每动一次 changed
  const UIPanGestureRecognizer = defineNativeClass('UIPanGestureRecognizer',
                                                   class UIPanGestureRecognizer extends UIGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UIPanGestureRecognizer', []);
    }
    // 最少要几根手指。默认 1
    get minimumNumberOfTouches() {
      requireNative(this, 'minimumNumberOfTouches');
      return nativeGet(this, 'minimumNumberOfTouches');
    }
    set minimumNumberOfTouches(value) {
      requireNative(this, 'minimumNumberOfTouches');
      nativeSet(this, 'minimumNumberOfTouches', toInteger(value, 'minimumNumberOfTouches'));
    }
    // 最多能有几根手指按着。默认 4294967295（实测，UINT_MAX），等于不限
    get maximumNumberOfTouches() {
      requireNative(this, 'maximumNumberOfTouches');
      return nativeGet(this, 'maximumNumberOfTouches');
    }
    set maximumNumberOfTouches(value) {
      requireNative(this, 'maximumNumberOfTouches');
      nativeSet(this, 'maximumNumberOfTouches', toInteger(value, 'maximumNumberOfTouches'));
    }
    // 认哪几种滚动输入（鼠标滚轮、触控板）。位掩码，字符串数组，默认是空的
    get allowedScrollTypesMask() {
      requireNative(this, 'allowedScrollTypesMask');
      return nativeGet(this, 'allowedScrollTypesMask');
    }
    set allowedScrollTypesMask(value) {
      requireNative(this, 'allowedScrollTypesMask');
      nativeSet(this, 'allowedScrollTypesMask', value);
    }
    // 从手势开始到现在手指移动了多少，在 view 的坐标系里。view 给 null 是
    // 窗口的坐标系。回调里读到的是回调执行那一刻的值；ended 那一刻的值在
    // 事件对象上
    translationInView(view) {
      return toPoint(nativeCall(this, 'translationInView:', [view]));
    }
    // 把位移改成一个新的值，之后从它接着累计。没有手势在进行时不生效（实测）
    setTranslation(translation, options) {
      const p = structArg(translation, POINT_FIELDS, 'setTranslation');
      const o = options || {};
      if (!has(o, 'inView')) throw new TypeError('setTranslation needs { inView }');
      nativeCall(this, 'setTranslation:inView:', [p, o.inView]);
    }
    // 手指移动的速度，点每秒，在 view 的坐标系里
    velocityInView(view) {
      return toPoint(nativeCall(this, 'velocityInView:', [view]));
    }
  });

  // 捏合。连续手势，两根手指
  defineNativeClass('UIPinchGestureRecognizer',
                    class UIPinchGestureRecognizer extends UIGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UIPinchGestureRecognizer', []);
    }
    // 两指间距相对手势开始时的倍数。默认 1。可写：写了之后从这个值接着算
    get scale() { requireNative(this, 'scale'); return nativeGet(this, 'scale'); }
    set scale(value) { requireNative(this, 'scale'); nativeSet(this, 'scale', toNumber(value, 'scale')); }
    // scale 每秒变多少
    get velocity() { requireNative(this, 'velocity'); return nativeGet(this, 'velocity'); }
  });

  // 旋转。连续手势，两根手指
  defineNativeClass('UIRotationGestureRecognizer',
                    class UIRotationGestureRecognizer extends UIGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UIRotationGestureRecognizer', []);
    }
    // 相对手势开始时转了多少，**弧度**。默认 0。可写
    get rotation() { requireNative(this, 'rotation'); return nativeGet(this, 'rotation'); }
    set rotation(value) {
      requireNative(this, 'rotation');
      nativeSet(this, 'rotation', toNumber(value, 'rotation'));
    }
    // 弧度每秒
    get velocity() { requireNative(this, 'velocity'); return nativeGet(this, 'velocity'); }
  });

  // 轻扫。离散手势：认出来时只发一次 ended
  defineNativeClass('UISwipeGestureRecognizer',
                    class UISwipeGestureRecognizer extends UIGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UISwipeGestureRecognizer', []);
    }
    // 要几根手指。默认 1
    get numberOfTouchesRequired() {
      requireNative(this, 'numberOfTouchesRequired');
      return nativeGet(this, 'numberOfTouchesRequired');
    }
    set numberOfTouchesRequired(value) {
      requireNative(this, 'numberOfTouchesRequired');
      nativeSet(this, 'numberOfTouchesRequired', toInteger(value, 'numberOfTouchesRequired'));
    }
    // 认哪几个方向。位掩码，字符串数组，默认 ['right']。名字 ↔ 数值的表和
    // 写错时的报错都在原生层
    get direction() { requireNative(this, 'direction'); return nativeGet(this, 'direction'); }
    set direction(value) { requireNative(this, 'direction'); nativeSet(this, 'direction', value); }
  });

  // 屏幕边缘拖动。拖动的子类：只认从屏幕边缘滑进来的
  defineNativeClass('UIScreenEdgePanGestureRecognizer',
                    class UIScreenEdgePanGestureRecognizer extends UIPanGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UIScreenEdgePanGestureRecognizer', []);
    }
    // 认哪几条边。位掩码，字符串数组，默认是空的——不设就什么都认不出
    get edges() { requireNative(this, 'edges'); return nativeGet(this, 'edges'); }
    set edges(value) { requireNative(this, 'edges'); nativeSet(this, 'edges', value); }
  });

})
