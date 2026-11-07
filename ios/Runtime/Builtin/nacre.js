// Nacre 运行时的内置脚本：在 main.js 之前执行，装上层 API。
// 这里定义的 EventTarget / Event 不是 ECMAScript 的一部分，V8 不提供，由运行时补。
'use strict';

(function (native) {
  // 用 IIFE 作用域内的 Symbol 存内部状态：既能跨类访问，又不出现在公开属性上
  const kTarget = Symbol('target');
  const kDefaultPrevented = Symbol('defaultPrevented');
  const kStopImmediate = Symbol('stopImmediate');
  const kListeners = Symbol('listeners');

  function define(obj, name, value) {
    // 和 ECMAScript 内置一致：不可枚举、可写、可配置
    Object.defineProperty(obj, name, {
      value, writable: true, enumerable: false, configurable: true,
    });
  }

  // ---------- Event ----------

  class Event {
    constructor(type, options) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to construct 'Event': 1 argument required, but only 0 present.");
      }
      const o = options == null ? {} : options;
      Object.defineProperty(this, 'type', { value: String(type), enumerable: true });
      Object.defineProperty(this, 'cancelable', { value: Boolean(o.cancelable), enumerable: true });
      this[kTarget] = null;
      this[kDefaultPrevented] = false;
      this[kStopImmediate] = false;
    }
    get target() { return this[kTarget]; }
    get currentTarget() { return this[kTarget]; }
    get defaultPrevented() { return this[kDefaultPrevented]; }
    preventDefault() {
      // cancelable 为 false 时静默失效，和标准一致
      if (this.cancelable) this[kDefaultPrevented] = true;
    }
    // 目前不做传播，保留接口是为了将来加冒泡时不破坏既有代码
    stopPropagation() {}
    stopImmediatePropagation() { this[kStopImmediate] = true; }
  }

  // ---------- EventTarget ----------

  class EventTarget {
    constructor() {
      Object.defineProperty(this, kListeners, {
        value: new Map(), writable: false, enumerable: false, configurable: false,
      });
    }

    addEventListener(type, callback, options) {
      if (arguments.length < 2) {
        throw new TypeError("Failed to execute 'addEventListener': 2 arguments required.");
      }
      if (callback == null) return;
      if (typeof callback !== 'function') {
        throw new TypeError("Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.");
      }
      const t = String(type);
      const once = typeof options === 'object' && options !== null ? Boolean(options.once) : false;
      let list = this[kListeners].get(t);
      if (list === undefined) {
        list = [];
        this[kListeners].set(t, list);
      }
      // 同一个 (type, callback) 只注册一次，和标准一致
      for (const entry of list) if (entry.callback === callback) return;
      list.push({ callback, once });
    }

    removeEventListener(type, callback) {
      const list = this[kListeners].get(String(type));
      if (list === undefined) return;
      for (let i = 0; i < list.length; i++) {
        if (list[i].callback === callback) { list.splice(i, 1); return; }
      }
    }

    dispatchEvent(event) {
      if (!(event instanceof Event)) {
        throw new TypeError("Failed to execute 'dispatchEvent': parameter 1 is not of type 'Event'.");
      }
      event[kTarget] = this;
      event[kStopImmediate] = false;
      const list = this[kListeners].get(event.type);
      if (list !== undefined) {
        // 先快照：派发过程中增删监听器不影响本轮
        for (const entry of list.slice()) {
          // once 的监听器在调用前就移除，和标准一致
          if (entry.once) this.removeEventListener(event.type, entry.callback);
          try {
            entry.callback.call(this, event);
          } catch (e) {
            // 一个监听器抛异常不能中断其余监听器，也不能冒到派发方
            console.error('事件监听器抛出异常: ' + (e && e.stack ? e.stack : e));
          }
          if (event[kStopImmediate]) break;
        }
      }
      return !event[kDefaultPrevented];
    }
  }

  // ---------- 错误类事件 ----------
  // 这两类事件由运行时在 JS 线程上同步派发，派发方拿得到返回值，
  // 所以是 cancelable 的：调 preventDefault() 就不会再打运行时的默认日志。

  function defineField(obj, name, value) {
    Object.defineProperty(obj, name, { value, enumerable: true });
  }

  class ErrorEvent extends Event {
    constructor(type, options) {
      const o = options == null ? {} : options;
      super(type, o);
      defineField(this, 'message', o.message === undefined ? '' : o.message);
      defineField(this, 'error', o.error);
      defineField(this, 'filename', o.filename === undefined ? '' : o.filename);
      defineField(this, 'lineno', o.lineno === undefined ? 0 : o.lineno);
    }
  }

  class PromiseRejectionEvent extends Event {
    constructor(type, options) {
      const o = options == null ? {} : options;
      super(type, o);
      defineField(this, 'reason', o.reason);
      defineField(this, 'promise', o.promise);
    }
  }

  // ---------- 原生对象的包装 ----------
  // 句柄 id 挂在闭包里的 Symbol 上，而不是 V8 的 internal field。
  // 用 internal field 就得绕过 JS 构造函数来建对象，EventTarget 的
  // 监听器表就初始化不了。
  const kHandle = Symbol('nativeHandle');

  const nativeClasses = Object.create(null);
  let allowNativeConstruct = false;

  function defineNativeClass(name, cls) {
    nativeClasses[name] = cls;
    define(globalThis, name, cls);
    return cls;
  }

  // 原生属性的读写。值走 JSON 编码，所以字符串、数字、布尔、数组、字典都能过。
  // 这样加一个属性不用动 C++，只要在 iOS 层的分发表里加一行。
  function nativeGet(obj, name) {
    return JSON.parse(native.getProp(obj[kHandle], name));
  }
  function nativeSet(obj, name, value) {
    native.setProp(obj[kHandle], name,
                   JSON.stringify(value === undefined ? null : value));
  }
  function nativeGetObject(obj, name) {
    const result = native.getObjProp(obj[kHandle], name);
    return result === undefined ? null : result;
  }
  function nativeCallAsync(obj, name, args) {
    return native.callAsync(obj[kHandle], name, JSON.stringify(args || []));
  }
  function nativeSetObject(obj, name, value) {
    native.setObjProp(obj[kHandle], name, value == null ? 0 : value[kHandle]);
  }
  function nativeCallVoid(obj, name) {
    native.callVoid(obj[kHandle], name);
  }
  // JS 构造原生对象：先有 this，再让原生造出对象并和 this 绑定。
  // 和包装工厂方向相反——那边是原生对象先有、JS 包装后建。
  function constructNative(wrapper, className, args) {
    const handles = (args || []).map((a) => (a == null ? 0 : a[kHandle]));
    const handle = native.construct(className, handles, wrapper);
    if (handle) Object.defineProperty(wrapper, kHandle, { value: handle });
  }

  // 只有被原生侧创建时才允许构造。用于系统给的对象（场景、session）。
  function nativeOnly() {
    if (!allowNativeConstruct) throw new TypeError('Illegal constructor');
  }

  // 继承链上的空壳：自己不可直接构造，但不能挡住可构造的子类。
  // new.target 在子类的 super() 调用里是子类，据此区分。
  function shellOnly(target, cls) {
    if (target === cls && !allowNativeConstruct) {
      throw new TypeError('Illegal constructor');
    }
  }

  // ---- 继承链的空壳 ----
  // 照搬 ObjC 的继承关系，现在先空着，以后往上加成员时子类自动继承。
  // UIResponder 在 ObjC 里的定义就是「能接收事件的对象」，和 EventTarget 语义吻合。
  const UIResponder = defineNativeClass('UIResponder', class UIResponder extends EventTarget {
    constructor() { shellOnly(new.target, UIResponder); super(); }
  });
  const UIScene = defineNativeClass('UIScene', class UIScene extends UIResponder {
    constructor() { shellOnly(new.target, UIScene); super(); }
  });
  const UIView = defineNativeClass('UIView', class UIView extends UIResponder {
    constructor() { shellOnly(new.target, UIView); super(); }
  });

  // 场景的持久身份。场景对象会被系统销毁重建，session 活得更久——
  // persistentIdentifier 用来认出「是不是之前那个窗口」。
  defineNativeClass('UISceneSession', class UISceneSession extends EventTarget {
    constructor() { nativeOnly(); super(); }
    // 'UIWindowSceneSessionRoleApplication' 等，决定这个场景该画什么界面
    get role() { return nativeGet(this, 'role'); }
    get persistentIdentifier() { return nativeGet(this, 'persistentIdentifier'); }
    get userInfo() { return nativeGet(this, 'userInfo'); }
    set userInfo(value) { nativeSet(this, 'userInfo', value); }
  });

  // 系统创建并连接的场景。不可构造——SDK 自己就是 init NS_UNAVAILABLE，
  // 注释写着「由 UIKit 调用，不打算让 App 调用」。
  defineNativeClass('UIWindowScene', class UIWindowScene extends UIScene {
    constructor() { nativeOnly(); super(); }

    // 这个场景自己的前后台状态，和 application.state（所有场景的聚合）不是一回事
    get activationState() { return nativeGet(this, 'activationState'); }
    get session() { return nativeGetObject(this, 'session'); }
    // ObjC 的属性名是 fullScreen，getter 是 isFullScreen，这里用后者
    get isFullScreen() { return nativeGet(this, 'isFullScreen'); }

    // 多任务切换器的卡片上显示的标题
    get title() { return nativeGet(this, 'title'); }
    set title(value) { nativeSet(this, 'title', value); }
    get subtitle() { return nativeGet(this, 'subtitle'); }
    set subtitle(value) { nativeSet(this, 'subtitle', value); }

    // 场景级的打开 URL。application.openURL 是 App 级的，两者都有
    openURL(url, options) { return nativeCallAsync(this, 'openURL', [String(url)]); }
  });

  // 页面。可构造——它是我们造的，不是系统给的。
  defineNativeClass('UIViewController', class UIViewController extends UIResponder {
    constructor() {
      super();
      if (allowNativeConstruct) return;  // 包装已有原生对象，句柄由工厂挂
      constructNative(this, 'UIViewController', []);
    }
    get view() { return nativeGetObject(this, 'view'); }
  });

  // 视图树的根。必须绑定到一个场景——initWithWindowScene: 是唯一未废弃的
  // 初始化方法，init 和 initWithFrame: 在 iOS 26 都废弃了。
  defineNativeClass('UIWindow', class UIWindow extends UIView {
    constructor(scene) {
      super();
      if (allowNativeConstruct) return;
      if (scene == null) {
        throw new TypeError("new UIWindow(scene)：必须指定一个 UIWindowScene");
      }
      constructNative(this, 'UIWindow', [scene]);
    }

    // 可写：换 scene 就是换显示目标。典型 App 一绑到死，
    // 需要改的场景是把窗口移到外接显示器（setScreen: 废弃后的替代品就是它）
    get windowScene() { return nativeGetObject(this, 'windowScene'); }
    set windowScene(value) { nativeSetObject(this, 'windowScene', value); }

    // 窗口唯一的内容入口，不设就没内容
    get rootViewController() { return nativeGetObject(this, 'rootViewController'); }
    set rootViewController(value) { nativeSetObject(this, 'rootViewController', value); }

    // 多窗口的叠放顺序。键盘、alert 都是 level 更高的窗口
    get windowLevel() { return nativeGet(this, 'windowLevel'); }
    set windowLevel(value) { nativeSet(this, 'windowLevel', value); }

    get isKeyWindow() { return nativeGet(this, 'isKeyWindow'); }
    get canBecomeKeyWindow() { return nativeGet(this, 'canBecomeKeyWindow'); }

    // 程序创建的 UIWindow 默认 hidden=YES，不调这个屏幕就是黑的
    makeKeyAndVisible() { nativeCallVoid(this, 'makeKeyAndVisible'); }
    makeKeyWindow() { nativeCallVoid(this, 'makeKeyWindow'); }
  });

  // 原生要给某个对象自己派发事件时回调这里（场景的生命周期事件走这条路）
  native.setObjectEventSink(function (wrapper, type) {
    wrapper.dispatchEvent(new Event(type));
  });

  // C++ 要建包装对象时回调这里。走正常的 new，EventTarget 的构造函数才会跑。
  // 同一个原生指针 C++ 那边会复用已有的包装，所以 === 成立。
  native.setWrapperFactory(function (className, handle) {
    const Cls = nativeClasses[className];
    if (Cls === undefined) return null;
    allowNativeConstruct = true;
    let wrapper;
    try {
      wrapper = new Cls();
    } finally {
      allowNativeConstruct = false;
    }
    Object.defineProperty(wrapper, kHandle, { value: handle });
    return wrapper;
  });

  // ---------- Application ----------

  function deepFreeze(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) deepFreeze(value[key]);
    return value;
  }

  let allowConstruct = false;
  let infoCache = null;

  // 实时环境值。每次读取都向原生要最新快照并解析一次 JSON——
  // 这些值变化稀疏、读取也不频繁，先用最简单的做法；成为热点再说。
  function env() {
    return JSON.parse(native.environmentJSON());
  }

  class Application extends EventTarget {
    constructor() {
      if (!allowConstruct) throw new TypeError('Illegal constructor');
      super();
    }

    // Info.plist 的只读快照。是运行时已解析的那份，不是源文件
    get info() {
      if (infoCache === null) infoCache = deepFreeze(JSON.parse(native.infoJSON()));
      return infoCache;
    }
    get bundleIdentifier() { return this.info.CFBundleIdentifier; }
    get version() { return this.info.CFBundleShortVersionString; }
    get build() { return this.info.CFBundleVersion; }

    // --- 运行状态 ---
    // 前后台切换时会变，所以每次都问原生
    get state() { return env().state; }
    get protectedDataAvailable() { return env().protectedDataAvailable; }

    // --- 环境与偏好 ---
    // 实际能力 = Info.plist 声明 AND 运行环境允许。
    // 要读声明值用 info.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes
    get supportsMultipleScenes() { return env().supportsMultipleScenes; }
    get layoutDirection() { return env().layoutDirection; }
    get contentSizeCategory() { return env().contentSizeCategory; }
    get backgroundRefreshStatus() { return env().backgroundRefreshStatus; }
    // iOS 27 才有，更低版本上读到 false
    get prefersReducedResourceUsage() {
      const value = env().prefersReducedResourceUsage;
      return value === undefined ? false : value;
    }

    // --- 可写 ---
    // 写入要切到主线程，是异步生效的；读回来的是原生的真实值
    get idleTimerDisabled() { return env().idleTimerDisabled; }
    set idleTimerDisabled(value) { native.setIdleTimerDisabled(Boolean(value)); }

    // 系统已连接的场景。**启动时通常是空的**——场景在 didFinishLaunching
    // 之后才接入，所以 UI 必须靠 sceneconnect 事件驱动，不能在这里取。
    get scenes() { return native.scenes(); }

    // --- 方法 ---
    // 打开 URL：跳 Safari、拨号、跳别的 App。URL 无效或系统拒绝时兑现为 false。
    // options 暂时没有可透传的键，先占位
    openURL(url, options) {
      return native.openURL(String(url));
    }
  }

  allowConstruct = true;
  const application = new Application();
  allowConstruct = false;

  // 运行时派发事件的统一入口。返回值告诉原生侧 JS 有没有调 preventDefault()
  native.setEventSink(function (type, payload) {
    let event;
    if (type === 'error') {
      event = new ErrorEvent(type, Object.assign({ cancelable: true }, payload));
    } else if (type === 'unhandledrejection') {
      event = new PromiseRejectionEvent(type, Object.assign({ cancelable: true }, payload));
    } else {
      // 原生通知派发的事件：运行时刻意延后一轮执行，派发方早已返回，所以不可取消
      event = new Event(type);
      // payload 里的字段原样挂到事件上，比如 sceneconnect 的 event.scene
      if (payload != null) {
        for (const key of Object.keys(payload)) defineField(event, key, payload[key]);
      }
    }
    return application.dispatchEvent(event);
  });

  define(globalThis, 'Event', Event);
  define(globalThis, 'ErrorEvent', ErrorEvent);
  define(globalThis, 'PromiseRejectionEvent', PromiseRejectionEvent);
  define(globalThis, 'EventTarget', EventTarget);
  define(globalThis, 'Application', Application);
  define(globalThis, 'application', application);

  delete globalThis.__nacre_native;
})(globalThis.__nacre_native);
