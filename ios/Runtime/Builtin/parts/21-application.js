// Application、它的环境快照和那个单例
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    ErrorEvent,
    Event,
    EventTarget,
    PromiseRejectionEvent,
    defineField,
    disown,
    nativeClassObject,
    own,
    ownAll,
    ownOne,
    native,
  } = ctx;

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
    /** 令牌和密码的安全存放。全是 Promise */
    get keychain() {
      return own(this, 'keychain', nativeClassObject('Keychain', 'default'));
    }
    /** 文件读写。全是 Promise——JS 在主线程，同步读会卡 UI */
    get fileSystem() {
      return own(this, 'fileSystem', nativeClassObject('FileSystem', 'default'));
    }
    /** 本地存储。就是 NSUserDefaults 的 standard 实例，App 级单例 */
    get storage() {
      return own(this, 'storage', nativeClassObject('NSUserDefaults', 'standardUserDefaults'));
    }
    get scenes() { return ownAll(this, 'scenes', native.scenes()); }

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
      // 场景的包装由 application 兜着：它是永久的，而场景的包装一旦被回收，
      // 后面派发给这个场景的事件就落到一个新包装上，监听器全丢。
      const scene = payload == null ? null : payload.scene;
      if (type === 'sceneconnect') ownOne(application, 'scenes', scene);
      else if (type === 'scenedisconnect') disown(application, 'scenes', scene);
    }
    return application.dispatchEvent(event);
  });


  // 这个 part 对外提供的东西
  Object.assign(ctx, { Application, application });
})
