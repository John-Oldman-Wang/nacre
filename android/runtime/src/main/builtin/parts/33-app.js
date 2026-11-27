// App 层：application 的包信息、openURL()、trimmemory、openurl；页面（activity）的生命周期、
// 返回、配置。原生那一侧是 AppDomain.kt。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 成员加在已有的 Application（21-application.js）和 Activity（10-view.js）上，不改那两个文件。
//
// 运行时跟着 App 生死，页面来来去去，可能一个都没有，所以整个 App 的事不经过页面：
// application 在这里绑上这个进程的 Application 对象（原生的 construct 交回 App 本身），
// 包信息、openURL()、trimmemory 都直接走它。被链接打开是哪个页面收到的，原生发在那个页面上
// （内部的名字 @openurl），这里转成 application 上的 openurl，带上 activity。
(function (ctx) {
  'use strict';

  const {
    Activity,
    Application,
    Event,
    application,
    define,
    defineEventClass,
    describeValue,
    eventClasses,
    kHandle,
    kSubscribe,
    native,
    nativeCallAsync,
    nativeGet,
    nativeSet,
    subscribeNative,
    toText,
  } = ctx;

  // ---- application 绑上 App 本身 ----

  const handle = native.construct('Application', [], [], application);
  if (!handle) throw new Error('internal: cannot bind application to the Android Application');
  Object.defineProperty(application, kHandle, { value: handle });

  // ---- 事件类 ----

  // 预测性返回的手势：开始、进行中。progress 是 0 到 1；touchX、touchY 是手指在窗口里的位置，
  // 单位 dp，按返回键这类没有手指的是 null；swipeEdge 是从哪条边滑进来的（'left'、'right'，
  // 没有边的是 'none'）
  const BackEvent = defineEventClass('BackEvent', Event, {
    progress: ['number', 0],
    touchX: ['number?', null],
    touchY: ['number?', null],
    swipeEdge: ['string', 'none'],
  });

  // 内存告警。level 照 ComponentCallbacks2 的 TRIM_MEMORY_ 常量：去掉前缀、首字母小写
  const TrimMemoryEvent = defineEventClass('TrimMemoryEvent', Event, {
    level: ['string', ''],
  });

  // 被一条链接打开。url 是 intent 带的地址，原样；activity 是收到它的页面，必填
  const OpenURLEvent = defineEventClass('OpenURLEvent', Event, {
    url: ['string', ''],
    activity: ['any', null],
  }, {
    check(o) {
      if (!(o.activity instanceof Activity)) {
        throw new TypeError("Failed to construct 'OpenURLEvent': init.activity must be an Activity, got " +
                            describeValue(o.activity));
      }
    },
  });

  // 原生发在页面上的 @openurl 用的事件类：只带 url，不挂全局
  class OpenURLNotice extends Event {
    constructor(type, init) {
      super(type, init);
      this.url = init.url;
    }
  }
  eventClasses.set('@OpenURLNotice', OpenURLNotice);

  // ---- Configuration：系统给的一份配置快照 ----

  const kToken = Symbol('configuration');
  const configurationFields = ['orientation', 'screenWidth', 'screenHeight', 'smallestScreenWidth',
                               'density', 'fontScale', 'isNightModeActive', 'locales', 'layoutDirection'];

  class Configuration {
    #values;
    constructor(token, values) {
      if (token !== kToken) throw new TypeError('Illegal constructor: Configuration is given by the system');
      this.#values = values;
    }
    // 每个字段一个只读的 getter。写在类里面（静态块），#values 才看得见
    static {
      for (const name of configurationFields) {
        Object.defineProperty(this.prototype, name, {
          get() { return this.#values[name]; },
          enumerable: true,
          configurable: true,
        });
      }
    }
  }

  function makeConfiguration(raw) {
    const values = Object.create(null);
    for (const name of configurationFields) values[name] = raw[name];
    values.locales = Object.freeze(raw.locales.slice());
    return Object.freeze(new Configuration(kToken, values));
  }

  // ---- 页面上的成员 ----

  // 原生真的会发的事件。别的名字（create、destroy、openurl……）是 JS 自己的自定义事件
  const appActivityEvents = new Set(['start', 'resume', 'pause', 'stop', 'back', 'backstart',
                                     'backprogress', 'backcancel', 'configurationchange', '@openurl']);
  const baseSubscribe = Activity.prototype[kSubscribe];
  Activity.prototype[kSubscribe] = function (type, on) {
    if (appActivityEvents.has(type)) subscribeNative(this, type, on);
    else baseSubscribe.call(this, type, on);
  };

  Object.defineProperties(Activity.prototype, {
    // 生命周期的状态，照 AndroidX 的 Lifecycle.State 小写：initialized、created、started、
    // resumed、destroyed。只有系统改得了，变化时有 start、resume、pause、stop 四个事件
    lifecycleState: {
      get() { return nativeGet(this, 'lifecycleState'); },
      enumerable: true, configurable: true,
    },
    // 屏幕方向、尺寸（dp）、密度、字号、深色模式、语言……的一份快照，每次读是新的一份。
    // 变化时有 configurationchange
    configuration: {
      get() { return makeConfiguration(nativeGet(this, 'configuration')); },
      enumerable: true, configurable: true,
    },
    // 返回键和返回手势由 JS 接还是交给系统。系统在手势开始前就要知道，所以提前设好。
    // 只有 JS 自己改，没有变化事件
    handlesBack: {
      get() { return nativeGet(this, 'handlesBack'); },
      set(value) { nativeSet(this, 'handlesBack', Boolean(value)); },
      enumerable: true, configurable: true,
    },
  });

  // ---- application 上的成员 ----

  let packageInfo = null;
  function info() {
    if (packageInfo === null) packageInfo = nativeGet(application, 'packageInfo');
    return packageInfo;
  }

  Object.defineProperties(Application.prototype, {
    // 包信息。App 运行期间不变，没有变化事件
    packageName: { get() { return info().packageName; }, enumerable: true, configurable: true },
    versionName: { get() { return info().versionName; }, enumerable: true, configurable: true },
    versionCode: { get() { return info().versionCode; }, enumerable: true, configurable: true },
  });

  // 把一个地址交给系统打开（ACTION_VIEW）。打开了兑现为 true；没有 App 能处理兑现为 false，
  // 不拒绝。用 App 的环境打开，没有页面时也能调
  define(Application.prototype, 'openURL', function openURL(url) {
    if (arguments.length < 1) {
      throw new TypeError("Failed to execute 'openURL' on 'Application': 1 argument required, but only 0 present.");
    }
    return nativeCallAsync(this, 'openURL', [toText(url)]);
  });

  // openurl：application 上有人订时，每个页面（现在有的、以后建的）都订着 @openurl，转过来
  let watchingOpenURL = false;
  const forwardOpenURL = (e) => {
    application.dispatchEvent(new OpenURLEvent('openurl', { url: e.url, activity: e.target }));
  };
  function watchOpenURL(activity, on) {
    if (on) activity.addEventListener('@openurl', forwardOpenURL);
    else activity.removeEventListener('@openurl', forwardOpenURL);
  }
  // 21-application.js 先把页面登记进 activities 再派发，这个监听器排在 App 的前面
  application.addEventListener('activitycreate', (e) => {
    if (watchingOpenURL) watchOpenURL(e.activity, true);
  });

  const baseAppSubscribe = Application.prototype[kSubscribe];
  Application.prototype[kSubscribe] = function (type, on) {
    if (type === 'trimmemory') {
      subscribeNative(this, type, on);
    } else if (type === 'openurl') {
      watchingOpenURL = on;
      for (const activity of this.activities) watchOpenURL(activity, on);
    } else if (typeof baseAppSubscribe === 'function') {
      baseAppSubscribe.call(this, type, on);
    }
  };

  define(globalThis, 'Configuration', Configuration);
})
