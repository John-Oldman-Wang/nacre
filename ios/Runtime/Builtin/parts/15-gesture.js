// 手势识别器
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    defineNativeClass,
    kSubscribe,
    nativeGet,
    nativeGetObject,
    nativeSet,
    requireNative,
    subscribeNative,
    toBoolean,
    toInteger,
    toNumber,
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
  // 点按是**离散**手势：只发 ended（ObjC 里叫 recognized，是 ended 的别名）。
  // 长按是**连续**手势：began → changed* → ended / cancelled。
  const UIGestureRecognizer = defineNativeClass('UIGestureRecognizer',
                                                class UIGestureRecognizer extends NSObject {
    constructor() {
      super();
      // 基类自己什么手势都不认，ObjC 里也只是拿来继承的
      if (new.target === UIGestureRecognizer) {
        throw new TypeError(
          'Illegal constructor: UIGestureRecognizer is abstract; construct ' +
          'UITapGestureRecognizer or UILongPressGestureRecognizer instead');
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


})
