// 页面的覆写点：方向和状态栏；场景的几何信息、转屏、状态栏的现状。
//
// 方向和状态栏在 UIKit 里是页面子类覆写的 getter，这里是可写的属性：写进去的值
// 由原生存着，系统来问时替页面回答（原生在 NacrePageOverrides.mm：new 出来的
// 三种页面是运行时预置的原生子类，由它们覆写那几个 getter；系统的页面上写了抛）。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    define,
    defineNativeClass,
    kSubscribe,
    nativeCall,
    nativeCallVoid,
    nativeGet,
    nativeGetObject,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    requireNative,
    subscribeNative,
    toBoolean,
    toRect,
  } = ctx;

  // ---- 页面：五个覆写点和三个「通知系统重新来问」的方法 ----
  // 方向的数组、方向名、状态栏样式原样交给原生去认：写错时那边打警告，值不动
  Object.defineProperty(UIViewController.prototype, 'supportedInterfaceOrientations', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'supportedInterfaceOrientations'); return nativeGet(this, 'supportedInterfaceOrientations'); },
    set(value) { requireNative(this, 'supportedInterfaceOrientations'); nativeSet(this, 'supportedInterfaceOrientations', value); },
  });
  Object.defineProperty(UIViewController.prototype, 'preferredInterfaceOrientationForPresentation', {
    configurable: true,
    enumerable: false,
    get() {
      requireNative(this, 'preferredInterfaceOrientationForPresentation');
      return nativeGet(this, 'preferredInterfaceOrientationForPresentation');
    },
    set(value) {
      requireNative(this, 'preferredInterfaceOrientationForPresentation');
      nativeSet(this, 'preferredInterfaceOrientationForPresentation', value);
    },
  });
  Object.defineProperty(UIViewController.prototype, 'prefersInterfaceOrientationLocked', {
    configurable: true,
    enumerable: false,
    get() {
      requireNative(this, 'prefersInterfaceOrientationLocked');
      return nativeGet(this, 'prefersInterfaceOrientationLocked');
    },
    set(value) {
      requireNative(this, 'prefersInterfaceOrientationLocked');
      nativeSet(this, 'prefersInterfaceOrientationLocked', toBoolean(value));
    },
  });
  Object.defineProperty(UIViewController.prototype, 'prefersStatusBarHidden', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'prefersStatusBarHidden'); return nativeGet(this, 'prefersStatusBarHidden'); },
    set(value) { requireNative(this, 'prefersStatusBarHidden'); nativeSet(this, 'prefersStatusBarHidden', toBoolean(value)); },
  });
  Object.defineProperty(UIViewController.prototype, 'preferredStatusBarStyle', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'preferredStatusBarStyle'); return nativeGet(this, 'preferredStatusBarStyle'); },
    set(value) { requireNative(this, 'preferredStatusBarStyle'); nativeSet(this, 'preferredStatusBarStyle', value); },
  });
  define(UIViewController.prototype, 'setNeedsUpdateOfSupportedInterfaceOrientations', function setNeedsUpdateOfSupportedInterfaceOrientations() {
    requireNative(this, 'setNeedsUpdateOfSupportedInterfaceOrientations');
    nativeCallVoid(this, 'setNeedsUpdateOfSupportedInterfaceOrientations');
  });
  define(UIViewController.prototype, 'setNeedsStatusBarAppearanceUpdate', function setNeedsStatusBarAppearanceUpdate() {
    requireNative(this, 'setNeedsStatusBarAppearanceUpdate');
    nativeCallVoid(this, 'setNeedsStatusBarAppearanceUpdate');
  });
  define(UIViewController.prototype, 'setNeedsUpdateOfPrefersInterfaceOrientationLocked', function setNeedsUpdateOfPrefersInterfaceOrientationLocked() {
    requireNative(this, 'setNeedsUpdateOfPrefersInterfaceOrientationLocked');
    nativeCallVoid(this, 'setNeedsUpdateOfPrefersInterfaceOrientationLocked');
  });

  // ---- 场景：几何信息、状态栏的现状、请求转屏、geometrychange ----
  Object.defineProperty(UIWindowScene.prototype, 'effectiveGeometry', {
    configurable: true,
    enumerable: false,
    // 每次读给一份新的：它是读的那一刻的值
    get() { requireNative(this, 'effectiveGeometry'); return nativeGetObject(this, 'effectiveGeometry'); },
  });
  Object.defineProperty(UIWindowScene.prototype, 'statusBarManager', {
    configurable: true,
    enumerable: false,
    // 系统的对象一直跟着场景，由场景拿着它的包装
    get() { requireNative(this, 'statusBarManager'); return nativeGetOwned(this, 'statusBarManager'); },
  });
  // 已经是偏好里的方向：当场兑现。系统拒绝（出错回调是当场调的）：拒绝。否则等
  // geometrychange 把方向变成偏好里的一个再兑现。照 Web 的 screen.orientation.lock()
  define(UIWindowScene.prototype, 'requestGeometryUpdateWithPreferences',
         function requestGeometryUpdateWithPreferences(preferences) {
    requireNative(this, 'requestGeometryUpdateWithPreferences');
    if (!(preferences instanceof UIWindowSceneGeometryPreferencesIOS)) {
      throw new TypeError('requestGeometryUpdateWithPreferences needs a UIWindowSceneGeometryPreferencesIOS');
    }
    const wanted = preferences.interfaceOrientations;
    if (wanted.length === 0) {
      throw new TypeError('requestGeometryUpdateWithPreferences: the preferences have no interfaceOrientations');
    }
    const scene = this;
    if (wanted.includes(scene.effectiveGeometry.interfaceOrientation)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const onChange = () => {
        if (!wanted.includes(scene.effectiveGeometry.interfaceOrientation)) return;
        scene.removeEventListener('geometrychange', onChange);
        resolve();
      };
      scene.addEventListener('geometrychange', onChange);
      const refused = nativeCall(scene, 'requestGeometryUpdateWithPreferences:', [preferences]);
      if (refused !== null) {
        scene.removeEventListener('geometrychange', onChange);
        const error = /** @type {Error & { code?: number }} */ (new Error(refused.message));
        error.code = refused.code;
        reject(error);
      }
    });
  });
  // 场景原来只把 traitchange 告诉原生。geometrychange 也要：原生只给订了的场景派发
  const sceneSubscribe = UIWindowScene.prototype[kSubscribe];
  define(UIWindowScene.prototype, kSubscribe, function (type, on) {
    if (type === 'geometrychange') {
      subscribeNative(this, type, on);
      return;
    }
    sceneSubscribe.call(this, type, on);
  });

  defineNativeClass('UIWindowSceneGeometry', class UIWindowSceneGeometry extends NSObject {
    constructor() { nativeOnly(new.target); }
    get interfaceOrientation() { requireNative(this, 'interfaceOrientation'); return nativeGet(this, 'interfaceOrientation'); }
    get isInterfaceOrientationLocked() {
      requireNative(this, 'isInterfaceOrientationLocked');
      return nativeGet(this, 'isInterfaceOrientationLocked');
    }
    get isInteractivelyResizing() {
      requireNative(this, 'isInteractivelyResizing');
      return nativeGet(this, 'isInteractivelyResizing');
    }
  });

  defineNativeClass('UIStatusBarManager', class UIStatusBarManager extends NSObject {
    constructor() { nativeOnly(new.target); }
    get isStatusBarHidden() { requireNative(this, 'isStatusBarHidden'); return nativeGet(this, 'isStatusBarHidden'); }
    get statusBarStyle() { requireNative(this, 'statusBarStyle'); return nativeGet(this, 'statusBarStyle'); }
    get statusBarFrame() { requireNative(this, 'statusBarFrame'); return toRect(nativeGet(this, 'statusBarFrame')); }
  });

  defineNativeClass('UIWindowSceneGeometryPreferencesIOS',
                    class UIWindowSceneGeometryPreferencesIOS extends NSObject {
    // 方向名的数组；不给就是「没有偏好」。写错的名字在这里抛（构造参数）
    constructor(interfaceOrientations) {
      super();
      constructNative(this, new.target, 'UIWindowSceneGeometryPreferencesIOS',
                      [interfaceOrientations === undefined ? null : interfaceOrientations]);
    }
    get interfaceOrientations() {
      requireNative(this, 'interfaceOrientations');
      return nativeGet(this, 'interfaceOrientations');
    }
    set interfaceOrientations(value) {
      requireNative(this, 'interfaceOrientations');
      nativeSet(this, 'interfaceOrientations', value);
    }
  });
})
