// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// UINavigationController 补上的成员：工具条、返回手势、自动隐藏导航条、showViewController。
// navigationBar 定了暂不接；delegate 的回调已经是事件 beforeshow / show。
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    nativeCall,
    nativeGet,
    nativeGetObject,
    nativeGetOwned,
    nativeSet,
    requireNative,
    toBoolean,
  } = ctx;

  const define = (proto, name, value) => Object.defineProperty(proto, name, { configurable: true, enumerable: false, writable: true, value });

  // ---- UINavigationController：手写的类，这里只补它没有的成员 ----
  Object.defineProperty(UINavigationController.prototype, 'isToolbarHidden', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isToolbarHidden'); return nativeGet(this, 'isToolbarHidden'); },
    set(value) { requireNative(this, 'isToolbarHidden'); nativeSet(this, 'isToolbarHidden', toBoolean(value)); },
  });
  Object.defineProperty(UINavigationController.prototype, 'toolbar', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'toolbar'); return nativeGetOwned(this, 'toolbar'); },
  });
  Object.defineProperty(UINavigationController.prototype, 'interactivePopGestureRecognizer', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'interactivePopGestureRecognizer'); return nativeGetOwned(this, 'interactivePopGestureRecognizer'); },
  });
  Object.defineProperty(UINavigationController.prototype, 'interactiveContentPopGestureRecognizer', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'interactiveContentPopGestureRecognizer'); return nativeGetOwned(this, 'interactiveContentPopGestureRecognizer'); },
  });
  Object.defineProperty(UINavigationController.prototype, 'hidesBarsWhenKeyboardAppears', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'hidesBarsWhenKeyboardAppears'); return nativeGet(this, 'hidesBarsWhenKeyboardAppears'); },
    set(value) { requireNative(this, 'hidesBarsWhenKeyboardAppears'); nativeSet(this, 'hidesBarsWhenKeyboardAppears', toBoolean(value)); },
  });
  Object.defineProperty(UINavigationController.prototype, 'hidesBarsOnSwipe', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'hidesBarsOnSwipe'); return nativeGet(this, 'hidesBarsOnSwipe'); },
    set(value) { requireNative(this, 'hidesBarsOnSwipe'); nativeSet(this, 'hidesBarsOnSwipe', toBoolean(value)); },
  });
  Object.defineProperty(UINavigationController.prototype, 'barHideOnSwipeGestureRecognizer', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'barHideOnSwipeGestureRecognizer'); return nativeGetOwned(this, 'barHideOnSwipeGestureRecognizer'); },
  });
  Object.defineProperty(UINavigationController.prototype, 'hidesBarsWhenVerticallyCompact', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'hidesBarsWhenVerticallyCompact'); return nativeGet(this, 'hidesBarsWhenVerticallyCompact'); },
    set(value) { requireNative(this, 'hidesBarsWhenVerticallyCompact'); nativeSet(this, 'hidesBarsWhenVerticallyCompact', toBoolean(value)); },
  });
  Object.defineProperty(UINavigationController.prototype, 'hidesBarsOnTap', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'hidesBarsOnTap'); return nativeGet(this, 'hidesBarsOnTap'); },
    set(value) { requireNative(this, 'hidesBarsOnTap'); nativeSet(this, 'hidesBarsOnTap', toBoolean(value)); },
  });
  Object.defineProperty(UINavigationController.prototype, 'barHideOnTapGestureRecognizer', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'barHideOnTapGestureRecognizer'); return nativeGetObject(this, 'barHideOnTapGestureRecognizer'); },
  });
  define(UINavigationController.prototype, 'setToolbarHidden', function setToolbarHidden(hidden, options) {
    const o = options == null ? {} : options;
    nativeCall(this, 'setToolbarHidden:animated:', [toBoolean(hidden), toBoolean(o.animated)]);
  });
  // 在导航控制器上就是 push。和 pushViewController 一样不在 JS 一侧记所有权：
  // 页面进了栈，读 viewControllers 拿到的是同一个包装
  define(UINavigationController.prototype, 'showViewController', function showViewController(viewController, options) {
    const o = options == null ? {} : options;
    nativeCall(this, 'showViewController:sender:', [viewController, o.sender === undefined ? null : o.sender]);
  });
})
