// Nacre 运行时自己的 API。
//
// 这一份和平台无关：console、事件模型、application 在 Android 上也是这些。
// iOS 的原生符号（UIView、UIColor…）在 ios.d.ts。
//
// 一一对应的依据是 ios/Runtime/Builtin/nacre.js 和 ios/Runtime/NacreRuntime.mm，
// 改动时跑 ios/scripts/check-api.sh 核对。

// ---------------------------------------------------------------------------
// 这个运行时**没有**的东西
// ---------------------------------------------------------------------------
//
// 实测 globalThis 之后确认不存在（iOS 26 模拟器，V8 14.9.207.39 lite）：
//
//   setTimeout / setInterval / queueMicrotask   没有定时器，一个都没有
//   Intl                                        V8 lite 构建不带 ICU
//   fetch / URL / Headers / Request / Response   网络是第 6 步的事
//   TextEncoder / TextDecoder                    WHATWG 的，不是 ECMAScript
//   structuredClone                              HTML 规范的
//   WebAssembly                                  lite 模式不含
//   DOM 的一切                                    window、document、location、history
//
// 没有定时器这条影响最大：异步只能靠 Promise 和事件，没有「过一会儿再做」。
//
// `Intl` 比较特殊——TypeScript 的 ES lib 自带它的类型，我们没办法从 lib 里
// 减掉，所以类型上它看着存在、运行时却会抛 ReferenceError。下面重新声明一次
// 把它标成废弃，至少编辑器会划掉。`toLocaleString` 这类方法确实存在，但没有
// ICU 数据，退化成非本地化实现。
declare namespace Intl {
  /** @deprecated Nacre 没有 Intl：V8 lite 构建不带 ICU，运行时会抛 ReferenceError。 */
  interface NacreNotAvailable {}
}

// ---------------------------------------------------------------------------
// 事件模型
// ---------------------------------------------------------------------------
//
// 借了 W3C 的名字和基本语义，没借 passive、signal、composed、捕获阶段。
// 目前只有 target 阶段，不冒泡。

interface EventInit {
  /**
   * 能不能被 preventDefault() 取消。默认 false。
   *
   * 原生通知派发过来的事件**一律是 false**：运行时刻意把派发延后了一轮，
   * 派发方早就返回了，没有「默认动作」可以拦。
   */
  cancelable?: boolean;
}

declare class Event {
  constructor(type: string, options?: EventInit);
  /** 事件名，全小写。 */
  readonly type: string;
  readonly cancelable: boolean;
  /** 派发到的对象。没派发过是 null。 */
  readonly target: EventTarget | null;
  /** 不做传播，所以和 target 永远相同。 */
  readonly currentTarget: EventTarget | null;
  readonly defaultPrevented: boolean;
  /** cancelable 为 false 时静默失效，和标准一致。 */
  preventDefault(): void;
  /** 目前不做传播，是个空操作；留着是为了将来加冒泡时不破坏既有代码。 */
  stopPropagation(): void;
  stopImmediatePropagation(): void;
}

interface ErrorEventInit extends EventInit {
  message?: string;
  error?: unknown;
  filename?: string;
  lineno?: number;
}

/** 未捕获异常。在 application 上监听，preventDefault() 可以抑制运行时的默认日志。 */
declare class ErrorEvent extends Event {
  constructor(type: string, options?: ErrorEventInit);
  readonly message: string;
  /** 抛出来的那个值。通常是 Error，但 JS 允许抛任何东西。 */
  readonly error: unknown;
  readonly filename: string;
  readonly lineno: number;
}

interface PromiseRejectionEventInit extends EventInit {
  reason?: unknown;
  promise?: Promise<unknown>;
}

/** 未处理的 Promise 拒绝。同样可以 preventDefault() 抑制默认日志。 */
declare class PromiseRejectionEvent extends Event {
  constructor(type: string, options?: PromiseRejectionEventInit);
  readonly reason: unknown;
  readonly promise: Promise<unknown> | undefined;
}

interface AddEventListenerOptions {
  /** 触发一次后自动摘掉。 */
  once?: boolean;
}

type EventListener<E extends Event = Event> = (event: E) => void;

/**
 * 所有会发事件的东西的基类，原生类也继承它（NSObject extends EventTarget）。
 *
 * 不是 ECMAScript 的一部分——实测 globalThis 的内置里没有它，是运行时注入的。
 */
declare class EventTarget {
  constructor();
  addEventListener(
    type: string,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(type: string, callback: EventListener | null): void;
  /** 同步派发。返回 false 表示有监听器调了 preventDefault()。 */
  dispatchEvent(event: Event): boolean;
}

// ---------------------------------------------------------------------------
// application
// ---------------------------------------------------------------------------

/** 所有场景聚合出来的前后台状态。单个场景的状态看 UIWindowScene.activationState。 */
type ApplicationState = 'active' | 'inactive' | 'background' | 'unknown';

type BackgroundRefreshStatus = 'restricted' | 'denied' | 'available' | 'unknown';

type LayoutDirection = 'ltr' | 'rtl';

/** application 上能监听的事件。 */
type ApplicationEventType =
  // 生命周期
  | 'active'
  | 'inactive'
  | 'foreground'
  | 'background'
  | 'willterminate'
  // 场景接入 / 断开，事件对象带 scene
  | 'sceneconnect'
  | 'scenedisconnect'
  // 系统状态变化
  | 'memorywarning'
  | 'screenshot'
  | 'significanttimechange'
  | 'contentsizecategorychange'
  | 'protecteddataavailable'
  | 'protecteddataunavailable'
  | 'backgroundrefreshstatuschange'
  // 全局错误出口
  | 'error'
  | 'unhandledrejection';

/**
 * 已知事件名给补全，自定义的也接受——dispatchEvent 是公开 API，JS 可以派发
 * 自己的事件。`string & {}` 是让编辑器仍然提示已知值的惯用写法。
 */
type ApplicationEventName = ApplicationEventType | (string & {});

/** sceneconnect / scenedisconnect 带的事件对象。 */
interface SceneEvent extends Event {
  readonly scene: UIWindowScene;
}

/**
 * App 实例。只有一个，就是全局的 `application`。
 *
 * 不叫 window——UIWindow 在 iOS 里是真实存在的另一个东西，会撞。
 */
declare class Application extends EventTarget {
  /** Info.plist 的全部内容。 */
  readonly info: Readonly<Record<string, unknown>>;
  readonly bundleIdentifier: string;
  /** CFBundleShortVersionString */
  readonly version: string;
  /** CFBundleVersion */
  readonly build: string;
  readonly state: ApplicationState;
  readonly protectedDataAvailable: boolean;
  /**
   * 实际能不能多场景 ＝ Info.plist 里声明了 AND 当前环境允许。
   * 声明值本身在 info.UIApplicationSceneManifest 里。
   */
  readonly supportsMultipleScenes: boolean;
  readonly layoutDirection: LayoutDirection;
  /** UIContentSizeCategory 的原值，比如 'UICTContentSizeCategoryL'。 */
  readonly contentSizeCategory: string;
  readonly backgroundRefreshStatus: BackgroundRefreshStatus;
  readonly prefersReducedResourceUsage: boolean;
  /** 写 true 阻止自动锁屏。 */
  idleTimerDisabled: boolean;
  /** 当前连着的场景。系统的内部窗口不在里面。 */
  readonly scenes: readonly UIWindowScene[];
  /**
   * 兑现为 false 表示没有 App 能处理这个 URL。不会抛。
   *
   * ObjC 的 openURL:options:completionHandler: 还有一个 options（比如
   * UIApplicationOpenURLOptionUniversalLinksOnly），我们还没接，所以这里
   * 也不声明——类型定义不能承诺实现里没有的东西。
   */
  openURL(url: string): Promise<boolean>;

  addEventListener(
    type: 'sceneconnect' | 'scenedisconnect',
    callback: EventListener<SceneEvent> | null,
    options?: AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'error',
    callback: EventListener<ErrorEvent> | null,
    options?: AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'unhandledrejection',
    callback: EventListener<PromiseRejectionEvent> | null,
    options?: AddEventListenerOptions,
  ): void;
  addEventListener(
    type: ApplicationEventName,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
}

/** App 实例的单例。 */
declare const application: Application;

// ---------------------------------------------------------------------------
// console
// ---------------------------------------------------------------------------

interface Console {
  debug(...data: unknown[]): void;
  log(...data: unknown[]): void;
  info(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  error(...data: unknown[]): void;
}

/**
 * 约定：console.* 永不向 JS 抛异常。
 *
 * 还没做：Map / Set / Date / RegExp / TypedArray 的专门格式、循环引用检测、
 * 深度与长度截断、%s 占位符、table / group / count / time。
 */
declare const console: Console;
