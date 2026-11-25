// App 层：application 的包信息、openURL()、trimmemory；activity（App 唯一的页面）的
// 生命周期、返回、配置、被链接打开。原生那一侧是 AppDomain.kt。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 成员加在已有的 Application（21-application.js）和 Activity（10-view.js）上，不改那两个文件。
(function (ctx) {
  'use strict';

  const {
    Application,
    Event,
    application,
    define,
    defineEventClass,
    kSubscribe,
    nativeCallAsync,
    nativeClassCallValue,
    nativeGet,
    nativeSet,
    subscribeNative,
    toText,
  } = ctx;

  // 10-view.js 定义的页面类。这时 App 的代码还没跑，全局上的就是它
  const Activity = globalThis.Activity;

  // ---- 事件类 ----

  // 预测性返回的手势：开始、进行中。progress 是 0 到 1；touchX、touchY 是手指在窗口里的
  // 位置，单位像素；swipeEdge 是从哪条边滑进来的（'left'、'right'，按返回键这类没有边的是 'none'）
  const BackEvent = defineEventClass('BackEvent', Event, {
    progress: ['number', 0],
    touchX: ['number', 0],
    touchY: ['number', 0],
    swipeEdge: ['string', 'none'],
  });

  // 内存告警。level 照 ComponentCallbacks2 的 TRIM_MEMORY_ 常量：去掉前缀、首字母小写
  const TrimMemoryEvent = defineEventClass('TrimMemoryEvent', Event, {
    level: ['string', ''],
  });

  // 运行中被一条链接打开。url 是 intent 带的地址，原样
  const OpenURLEvent = defineEventClass('OpenURLEvent', Event, {
    url: ['string', ''],
  });

  // ---- Configuration：系统给的一份配置快照 ----

  const kToken = Symbol('configuration');
  const configurationFields = ['orientation', 'screenWidthDp', 'screenHeightDp', 'smallestScreenWidthDp',
                               'densityDpi', 'fontScale', 'isNightModeActive', 'locales', 'layoutDirection'];

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

  // 原生真的会发的事件。别的名字（create、destroy……）是 JS 自己的自定义事件
  const appActivityEvents = new Set(['start', 'resume', 'pause', 'stop', 'back', 'backstart',
                                     'backprogress', 'backcancel', 'configurationchange', 'openurl']);
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
    // 启动这个页面的 intent 带的地址，没有是 null。运行中再被打开不会变（那是 openurl 事件）
    launchURL: {
      get() { return nativeGet(this, 'launchURL'); },
      enumerable: true, configurable: true,
    },
    // 屏幕方向、尺寸、字号、深色模式、语言……的一份快照，每次读是新的一份。
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
    if (packageInfo === null) packageInfo = nativeClassCallValue('@application', 'packageInfo', []);
    return packageInfo;
  }

  Object.defineProperties(Application.prototype, {
    // 包信息。App 运行期间不变，没有变化事件
    packageName: { get() { return info().packageName; }, enumerable: true, configurable: true },
    versionName: { get() { return info().versionName; }, enumerable: true, configurable: true },
    versionCode: { get() { return info().versionCode; }, enumerable: true, configurable: true },
  });

  // 把一个地址交给系统打开（ACTION_VIEW）。打开了兑现为 true；没有 App 能处理兑现为 false，
  // 不拒绝
  define(Application.prototype, 'openURL', function openURL(url) {
    if (arguments.length < 1) {
      throw new TypeError("Failed to execute 'openURL' on 'Application': 1 argument required, but only 0 present.");
    }
    return nativeCallAsync(this.activity, 'openURL', [toText(url)]);
  });

  // 内存告警是整个 App 的事，挂在 application 上。application 没有原生对象，原生把它发在
  // 页面上（内部的名字 @trimmemory），这里转过来
  const forwardTrimMemory = (e) => {
    application.dispatchEvent(new TrimMemoryEvent('trimmemory', { level: e.level }));
  };
  Application.prototype[kSubscribe] = function (type, on) {
    if (type !== 'trimmemory') return;
    const activity = this.activity;
    if (on) {
      activity.addEventListener('@trimmemory', forwardTrimMemory);
      subscribeNative(activity, '@trimmemory', true);
    } else {
      subscribeNative(activity, '@trimmemory', false);
      activity.removeEventListener('@trimmemory', forwardTrimMemory);
    }
  };

  define(globalThis, 'Configuration', Configuration);
})
