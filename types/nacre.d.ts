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
//   Intl                                        V8 lite 构建不带 ICU
//   TextEncoder / TextDecoder                    WHATWG 的，不是 ECMAScript
//   structuredClone                              HTML 规范的
//   WebAssembly                                  lite 模式不含
//   DOM 的一切                                    window、document、location、history
//
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
// URL
// ---------------------------------------------------------------------------
//
// WHATWG 的 URL，解析底子是 NSURLComponents。**和浏览器有几处已知差异**，
// 见 docs/api/url.md——最要紧的一条是：**没有 base**。
//
//   new URL('/x')                    // 抛 TypeError
//   new URL('/x', 'https://a.com')   // 可以
//
// 浏览器里相对 URL 能解析是因为有当前文档的 base，这个运行时不通过 HTTP
// 加载 JS，没有 location，编不出 base 来。

declare class URL {
  /** base 省略时 url 必须是绝对的，否则抛 TypeError。 */
  constructor(url: string | URL, base?: string | URL);
  href: string;
  /** 只读。非 http(s) 一律是 'null'（字符串）。 */
  readonly origin: string;
  /** 带冒号，比如 'https:'。 */
  protocol: string;
  username: string;
  password: string;
  /** hostname[:port]，默认端口会被省掉。 */
  host: string;
  hostname: string;
  /** 默认端口（http 的 80、https 的 443…）读出来是空串。 */
  port: string;
  pathname: string;
  /** 带问号，空的时候是空串。 */
  search: string;
  /** 和 search 双向绑定：改这个，search 跟着变。 */
  readonly searchParams: URLSearchParams;
  /** 带井号，空的时候是空串。 */
  hash: string;
  toString(): string;
  toJSON(): string;
  /** 不抛的版本，省掉 try/catch。 */
  static canParse(url: string | URL, base?: string | URL): boolean;
  /** 解析不了返回 null，不抛。 */
  static parse(url: string | URL, base?: string | URL): URL | null;
}

type URLSearchParamsInit =
  | string
  | URLSearchParams
  | readonly (readonly [string, string])[]
  | Record<string, string>;

declare class URLSearchParams {
  constructor(init?: URLSearchParamsInit);
  readonly size: number;
  append(name: string, value: string): void;
  /** 传了 value 就只删名值都匹配的。 */
  delete(name: string, value?: string): void;
  /** 同名多值时返回第一个；没有返回 null。 */
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string, value?: string): boolean;
  /** 替换第一个同名的、删掉其余同名的，位置保持。 */
  set(name: string, value: string): void;
  /** 按名字排序，同名之间保持原有顺序。 */
  sort(): void;
  forEach(
    callback: (value: string, name: string, parent: URLSearchParams) => void,
    thisArg?: unknown,
  ): void;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  entries(): IterableIterator<[string, string]>;
  [Symbol.iterator](): IterableIterator<[string, string]>;
  /** application/x-www-form-urlencoded 编码——注意空格是 '+' 不是 '%20'。 */
  toString(): string;
}

// ---------------------------------------------------------------------------
// Headers
// ---------------------------------------------------------------------------

type HeadersInit =
  | Headers
  | readonly (readonly [string, string])[]
  | Record<string, string>;

/**
 * HTTP 首部集合。名字大小写不敏感，同名多值。
 *
 * 不做浏览器那套 forbidden header 检查（`Host`、`Cookie`、`Origin` 都能设）：
 * 那是防不受信任的页面伪造请求，而这里的 JS 和原生代码同等地位。
 */
declare class Headers {
  constructor(init?: HeadersInit);
  append(name: string, value: string): void;
  set(name: string, value: string): void;
  delete(name: string): void;
  has(name: string): boolean;
  /** 同名多值用 ', ' 合并成一个串；没有返回 null。 */
  get(name: string): string | null;
  /** Set-Cookie 不能合并，所以单独给一个取数组的方法。 */
  getSetCookie(): string[];
  /** 按名字排序迭代；Set-Cookie 不合并，有几条出几条。 */
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  [Symbol.iterator](): IterableIterator<[string, string]>;
  forEach(
    callback: (value: string, name: string, parent: Headers) => void,
    thisArg?: unknown,
  ): void;
}

// ---------------------------------------------------------------------------
// fetch
// ---------------------------------------------------------------------------
//
// 没有 CORS、没有同源策略、没有 credentials——那套是浏览器为不受信任的页面
// 设计的，这里的 JS 和原生代码同等地位。
//
// 也没有 ReadableStream：body 整个下完才兑现。流式第一版不做。

interface RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: string | null;
  /** 中止信号。一中止就取消在途的请求，Promise 以 AbortError 拒绝。 */
  signal?: AbortSignal | null;
}

/**
 * 一块不可变的字节。**字节留在原生侧，JS 只拿句柄**——所以拿到一个 Blob
 * 不会把内容压进 V8 堆。
 *
 * 视频切片这类场景正是为它设计的：fetch 一个切片拿到 Blob，交给播放器，
 * 字节从头到尾不进 JS。
 */
declare class Blob {
  constructor(parts?: readonly (string | ArrayBuffer | ArrayBufferView)[],
              options?: { type?: string });
  readonly size: number;
  readonly type: string;
  /** 零拷贝：原生那块内存直接交给 V8。 */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** 后台 UTF-8 解码。 */
  text(): Promise<string>;
}

/**
 * 中止信号。是个 EventTarget，中止时派发 'abort' 事件。
 *
 * 不能直接构造，用 `new AbortController().signal`、`AbortSignal.abort()`
 * 或 `AbortSignal.timeout(ms)`。
 */
declare class AbortSignal extends EventTarget {
  private constructor();
  readonly aborted: boolean;
  /** 中止的原因。默认是一个 name 为 'AbortError' 的 Error。 */
  readonly reason: unknown;
  /** 已中止时抛出 reason。 */
  throwIfAborted(): void;
  /** 一个已经中止的 signal。 */
  static abort(reason?: unknown): AbortSignal;
  /** 到点自动中止，reason 的 name 是 'TimeoutError'。 */
  static timeout(ms: number): AbortSignal;
}

declare class AbortController {
  constructor();
  readonly signal: AbortSignal;
  /** 中止。重复调用是空操作。 */
  abort(reason?: unknown): void;
}

/**
 * body 的四种读法。每个 body 只能读一次，读第二次会拒绝。
 *
 * 这是 interface 不是 class：和 Web 一样，`Body` 不是全局类，只是
 * `Request` 和 `Response` 共有的那组成员，靠下面的声明合并并进去。
 */
interface Body {
  readonly bodyUsed: boolean;
  /** 零拷贝：原生那块内存直接交给 V8，不经过复制。 */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** 后台 UTF-8 解码，一次拷贝。 */
  text(): Promise<string>;
  /** text() 再加一次 JSON.parse。 */
  json(): Promise<any>;
  /** 零拷贝，而且字节不进 V8 堆——大响应首选这个。 */
  blob(): Promise<Blob>;
}

declare class Response {
  constructor(body?: null, init?: { status?: number; statusText?: string; headers?: HeadersInit });
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly headers: Headers;
  /**
   * 只有 2xx 才是 true。
   *
   * **404 和 500 不会让 fetch 拒绝**——那是服务器正常答复了，只是答复的内容
   * 是个错误。fetch 只在网络层失败（DNS 挂了、连不上、被取消）时才拒绝。
   * 这是 Web 的语义，也是最常被误解的一条。
   */
  readonly ok: boolean;
  /** 重定向由系统处理，我们看不到中间过程，恒为 false。 */
  readonly redirected: boolean;
  /** 没有 CORS，恒为 'basic'。 */
  readonly type: string;
}

declare class Request {
  constructor(input: string | URL | Request, init?: RequestInit);
  readonly url: string;
  readonly method: string;
  readonly headers: Headers;
  clone(): Request;
}

/**
 * 发一个 HTTP 请求。
 *
 * URL 必须是绝对的——没有 location 就没有 base，`fetch('/api')` 会拒绝。
 */
// 声明合并：把 Body 的成员并进这两个类
interface Response extends Body {}
interface Request extends Body {}

declare function fetch(input: string | URL | Request, init?: RequestInit): Promise<Response>;

// ---------------------------------------------------------------------------
// 定时器
// ---------------------------------------------------------------------------
//
// Web 的 API，不是 Nacre 设计的。提供它是因为它是生态的底座——async/await
// 降级后的代码、debounce、测试框架都假设它存在。要 Promise 形态自己包一行：
//
//   await new Promise(r => setTimeout(r, 100));
//
// 返回的是 number，不是 Node 的 Timeout 对象，所以没有 .unref() 之类。

/**
 * 延迟执行一次。返回的 id 给 clearTimeout 用。
 *
 * 调度细节：同一时刻到期的多个定时器按注册顺序执行；一次唤醒最多占用主线程
 * 约 8ms，超了就让出去让界面有机会渲染，剩下的下一轮再跑。
 *
 * 注意 App 进入后台后定时器**不会触发**——这不是节流，是停。iOS 的事实。
 */
declare function setTimeout(
  handler: (...args: any[]) => void,
  delay?: number,
  ...args: any[]
): number;

/** 取消。id 不认识时静默忽略。 */
declare function clearTimeout(id?: number): void;

/**
 * 按间隔重复执行。
 *
 * 间隔不保证精确：主线程被 JS 占住时会晚。落后太多时不做补偿式连发，
 * 而是重新计时。
 */
declare function setInterval(
  handler: (...args: any[]) => void,
  delay?: number,
  ...args: any[]
): number;

/** 取消。id 不认识时静默忽略。 */
declare function clearInterval(id?: number): void;

/**
 * 排一个微任务。不是定时器——它在当前任务的微任务检查点里就会跑，
 * 不等下一轮事件循环。
 */
declare function queueMicrotask(callback: () => void): void;

// ---------------------------------------------------------------------------
// 高精度计时
// ---------------------------------------------------------------------------

/**
 * 高精度时钟。只有一个实例，就是全局的 `performance`。
 *
 * 和 Web、Node 的同名对象一致，但只有 `now()` 和 `timeOrigin`，没有
 * `mark()` / `measure()` 那一组。
 */
declare class Performance {
  private constructor();
  /**
   * 从运行时启动算起过了多少毫秒，带小数。单调递增，不受系统时间被修改的
   * 影响。只能用来算两次调用之间的差值，它不是日期。
   */
  now(): number;
  /** `now()` 的零点对应的时刻，Unix 毫秒时间戳。 */
  readonly timeOrigin: number;
  toJSON(): { timeOrigin: number };
}

declare const performance: Performance;

// ---------------------------------------------------------------------------
// 随机数
// ---------------------------------------------------------------------------

/** `crypto.getRandomValues()` 接受的数组：九种整数类型数组。 */
type IntegerTypedArray =
  | Int8Array | Uint8Array | Uint8ClampedArray
  | Int16Array | Uint16Array
  | Int32Array | Uint32Array
  | BigInt64Array | BigUint64Array;

/**
 * 密码学强度的随机数。只有一个实例，就是全局的 `crypto`。
 *
 * 和 Web、Node 的同名对象一致，但只有这两个方法，没有 `crypto.subtle`。
 */
declare class Crypto {
  private constructor();
  /**
   * 用随机值填满 `array`，再把它原样返回。随机源是系统提供的，可以用来
   * 生成密钥和令牌——`Math.random()` 不行。
   *
   * 一次最多 65536 字节，超过抛 `QuotaExceededError`；传浮点数组或
   * `DataView` 抛 `TypeMismatchError`。
   */
  getRandomValues<T extends IntegerTypedArray>(array: T): T;
  /** 一个随机生成的第 4 版 UUID，小写，形如 `3f2b8c1e-…`。 */
  randomUUID(): string;
}

declare const crypto: Crypto;

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
  /** 本地存储。就是 NSUserDefaults 的 standard 实例。 */
  readonly storage: NSUserDefaults;
  /** 文件读写。全是 Promise——JS 在主线程，同步读会卡 UI。 */
  readonly fileSystem: FileSystem;
  /** 令牌和密码的安全存放。全是 Promise。 */
  readonly keychain: Keychain;
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

/**
 * WebSocket 的 `message` 事件。
 *
 * 和别的带负载的事件一样，回调参数的类型没有窄化，要拿就转一下型：
 *
 * ```js
 * ws.addEventListener('message', (e) => {
 *   const data = /** @type {WebSocketMessageEvent} *\/ (e).data;
 * });
 * ```
 */
declare interface WebSocketMessageEvent extends Event {
  /** 文本消息是字符串，二进制消息是 `Blob`（字节不进 V8 堆）。 */
  readonly data: string | Blob;
}

/** WebSocket 的 `close` 事件。 */
declare interface WebSocketCloseEvent extends Event {
  /** 关闭码。正常关闭是 1000；连接异常断开是 1006。 */
  readonly code: number;
  readonly reason: string;
  /** 走完了关闭握手才是 `true`。连接断了是 `false`。 */
  readonly wasClean: boolean;
}

/** WebSocket 的 `error` 事件。 */
declare interface WebSocketErrorEvent extends Event {
  readonly message: string;
}

/**
 * 全双工的长连接。
 *
 * ```js
 * const ws = new WebSocket('wss://example.com/quotes', {
 *   headers: { Authorization: 'Bearer ' + token },
 * });
 * ws.addEventListener('open', () => ws.send('subscribe'));
 * ws.addEventListener('message', (e) => {
 *   console.log(/** @type {WebSocketMessageEvent} *\/ (e).data);
 * });
 * ws.close(1000, 'bye');
 * ```
 *
 * 形状照 Web，**两处比 Web 多**：
 *
 * | | |
 * | --- | --- |
 * | `headers` | 浏览器的构造器给不了首部，那是 Web 的历史限制不是协议的 |
 * | `ping()` | 协议级 ping，对端**必须**回 Pong，不需要服务端应用配合 |
 *
 * **没有 `bufferedAmount`**：`NSURLSessionWebSocketTask` 没有对应物。能自己
 * 数「发出去还没完成的条数」，但那和 Web 的「排队字节数」不是一个定义，
 * 同名不同义比没有更糟。
 */
declare class WebSocket extends NSObject {
  constructor(
    url: string,
    options?: {
      /** 子协议。服务端选中的那个在 `protocol` 上读得到。 */
      protocols?: string[];
      /** 握手请求的首部。**Web 给不了这个。** */
      headers?: Record<string, string>;
    },
  );

  static readonly CONNECTING: number;
  static readonly OPEN: number;
  static readonly CLOSING: number;
  static readonly CLOSED: number;

  addEventListener(
    type: 'open' | 'message' | 'error' | 'close',
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'open' | 'message' | 'error' | 'close',
    callback: EventListener | null,
  ): void;

  /**
   * 发一条。返回的 Promise 在**发出去之后**兑现，不等对端确认。
   *
   * `ArrayBuffer` 和 TypedArray 会被包成 `Blob` 再发。
   */
  send(data: string | Blob | ArrayBuffer | ArrayBufferView): Promise<boolean>;
  /** 协议级 ping。pong 回来就兑现，连接死了就拒绝。 */
  ping(): Promise<boolean>;
  /** 关。已经在关或关完了再调是空操作。 */
  close(code?: number, reason?: string): void;

  readonly url: string;
  /** `0` CONNECTING / `1` OPEN / `2` CLOSING / `3` CLOSED。 */
  readonly readyState: number;
  /** 服务端选中的子协议。没有就是空串。 */
  readonly protocol: string;
  /** 一条消息最大多少字节，超了接收会失败。**Web 没有这个。** */
  maximumMessageSize: number;
}
