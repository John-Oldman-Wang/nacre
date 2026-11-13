// 网页：WebView 和它里面的 webContents。
//
// 形状照 Electron 的 BrowserWindow / WebContentsView：视图管摆放，
// webContents 管加载和导航。方法名和事件名照搬 Electron 的 webContents。

/** `webContents` 上能监听的事件。名字照搬 Electron。 */
type WebContentsEventType =
  | 'will-navigate'
  | 'did-start-loading'
  | 'did-stop-loading'
  | 'did-finish-load'
  | 'did-fail-load'
  | 'did-navigate'
  | 'page-title-updated'
  | 'ipc-message'
  | 'preload-error'
  | 'render-process-gone'
  | 'destroyed';

/** `new WebView({ webPreferences })` 里的那一层。建好之后不能改。 */
interface WebPreferences {
  /**
   * 网页的数据（cookie、localStorage、缓存）存在哪一份里。
   *
   * - 不写：默认的那一份，落盘，下次启动还在
   * - `'persist:名字'`：落盘，同名的网页共用一份
   * - `'名字'`：只在内存里，同名的网页共用一份，App 退出就没了
   */
  partition?: string;
  /**
   * 预加载脚本的路径。相对路径相对 App 包，绝对路径原样用。
   *
   * 这个脚本在每张网页自己的脚本**之前**执行，只在主文档里执行（`<iframe>`
   * 里不执行）。它能用两个名字：`ipcRenderer`（和 App 互发消息）和
   * `contextBridge`（把东西挂到网页的 `window` 上）。
   *
   * 文件读不到、有语法错时，`new WebView` 当场抛。
   */
  preload?: string;
}

/**
 * 一次导航是怎么引起的。
 *
 * - `'linkActivated'`：点了链接
 * - `'formSubmitted'`：提交了表单
 * - `'backForward'`：网页自己后退或前进（`history.back()`）
 * - `'reload'`：网页自己刷新（`location.reload()`）
 * - `'formResubmitted'`：重新提交表单（后退到一个 POST 出来的页面）
 * - `'other'`：其余的，最常见的是脚本改 `location`
 */
type WebNavigationType =
  | 'linkActivated'
  | 'formSubmitted'
  | 'backForward'
  | 'reload'
  | 'formResubmitted'
  | 'other';

/**
 * `will-navigate` 事件：网页自己要跳到别的地址，还没开始跳。
 *
 * 调 `preventDefault()` 就不跳了，网页留在原地。
 *
 * ```js
 * contents.addEventListener('will-navigate', (e) => {
 *   if (!e.url.startsWith('https://my.app/')) e.preventDefault();
 * });
 * ```
 */
interface WebContentsWillNavigateEvent extends Event {
  /** 要去的地址。 */
  readonly url: string;
  /** 总是 `true`：`<iframe>` 里的跳转不派发这个事件。 */
  readonly isMainFrame: boolean;
  /** 这次跳转是怎么引起的。**Electron 没有这个字段。** */
  readonly navigationType: WebNavigationType;
}

/** `did-fail-load` 事件。 */
interface WebContentsDidFailLoadEvent extends Event {
  /**
   * 系统的错误码。常见的：`-999` 被停掉或被另一次导航顶掉，`-1003` 域名
   * 解析不了，`-1009` 没有网络，`-1001` 超时。
   *
   * **不是 Electron 的那一套数**（那是 Chromium 的错误码）。
   */
  readonly errorCode: number;
  /** 错误的文字说明。跟着系统语言走，只适合打日志，不要拿来判断。 */
  readonly errorDescription: string;
  /** 加载失败的那个地址。拿不到时是空串。 */
  readonly validatedURL: string;
  /** 总是 `true`：子框架的失败不会报到这里。 */
  readonly isMainFrame: boolean;
}

/** `did-navigate` 事件：网页换了一个文档。 */
interface WebContentsDidNavigateEvent extends Event {
  /** 新的地址。 */
  readonly url: string;
  /** HTTP 状态码。不是 HTTP 的导航（`data:`、`about:`）是 `-1`。 */
  readonly httpResponseCode: number;
}

/**
 * `ipc-message` 事件：网页的预加载脚本调了 `ipcRenderer.send(channel, ...args)`。
 *
 * 网页里的任何脚本都发得出这种消息，把它当成不可信的输入。
 */
interface WebContentsIpcMessageEvent extends Event {
  /** 频道名。 */
  readonly channel: string;
  /** 跟在频道名后面的那些参数。按 JSON 传过来的。 */
  readonly args: unknown[];
}

/** `preload-error` 事件：预加载脚本执行时抛了异常。 */
interface WebContentsPreloadErrorEvent extends Event {
  /** 建 `WebView` 时给的那个路径。 */
  readonly preloadPath: string;
  /** 抛出来的错误。`message` 是网页那边 `String(error)` 的结果。 */
  readonly error: Error;
}

/** `ipc.handle` 的处理函数拿到的第一个参数。 */
interface WebContentsIpcInvokeEvent {
  /** 发来请求的那张网页。 */
  readonly sender: WebContents;
}

/**
 * 请求-响应式的消息。从 `webContents.ipc` 拿，不能自己建。
 *
 * ```js
 * contents.ipc.handle('get-user', async (event, id) => {
 *   return { id, name: 'Jack' };
 * });
 * // 网页的预加载脚本里：const user = await ipcRenderer.invoke('get-user', 7)
 * ```
 */
interface WebContentsIPC {
  /**
   * 登记一个频道的处理函数。它的返回值（或者它返回的 Promise 兑现的值）
   * 就是网页那边 `ipcRenderer.invoke` 的结果；它抛了，网页那边就被拒绝。
   * 一个频道只能登记一个，重复登记会抛。
   */
  handle(
    channel: string,
    listener: (event: WebContentsIpcInvokeEvent, ...args: any[]) => unknown,
  ): void;
  /** 去掉一个频道的处理函数。没登记过也不报错。 */
  removeHandler(channel: string): void;
}

/** `page-title-updated` 事件。 */
interface WebContentsPageTitleUpdatedEvent extends Event {
  /** 新的标题。换页的瞬间会先变成空串。 */
  readonly title: string;
}

/** 每个事件名对应的事件对象。`addEventListener` 按它给回调的参数定类型。 */
interface WebContentsEventMap {
  'will-navigate': WebContentsWillNavigateEvent;
  'did-start-loading': Event;
  'did-stop-loading': Event;
  'did-finish-load': Event;
  'did-fail-load': WebContentsDidFailLoadEvent;
  'did-navigate': WebContentsDidNavigateEvent;
  'page-title-updated': WebContentsPageTitleUpdatedEvent;
  'ipc-message': WebContentsIpcMessageEvent;
  'preload-error': WebContentsPreloadErrorEvent;
  'render-process-gone': Event;
  'destroyed': Event;
}

/** 后退和前进。从 `webContents.navigationHistory` 拿，不能自己建。 */
interface NavigationHistory {
  /** 能不能后退。 */
  canGoBack(): boolean;
  /** 能不能前进。 */
  canGoForward(): boolean;
  /** 后退一页。不能后退时什么都不做。 */
  goBack(): void;
  /** 前进一页。不能前进时什么都不做。 */
  goForward(): void;
}

/**
 * 一张网页：加载、导航、事件。从 `webView.webContents` 拿，不能自己建。
 *
 * ```js
 * const contents = web.webContents;
 * contents.addEventListener('did-fail-load', (e) => {
 *   console.log('加载失败', e.errorCode, e.validatedURL);
 * });
 * await contents.loadURL('https://example.com/');
 * console.log(contents.getTitle());
 * ```
 */
declare class WebContents extends NSObject {
  private constructor();

  addEventListener<K extends WebContentsEventType>(
    type: K,
    callback: ((event: WebContentsEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends WebContentsEventType>(
    type: K,
    callback: ((event: WebContentsEventMap[K]) => void) | null,
  ): void;

  /**
   * 加载一个地址。地址要带协议（`https://`）。
   *
   * 加载完兑现；失败、被 `stop()` 停掉、被另一次导航顶掉都拒绝。拒绝的
   * 错误上有 `name`（`'AbortError'` / `'NetworkError'` / `'Error'`）、
   * `code` 和 `domain`（系统给的原值）。
   *
   * 不等这个 Promise、只听事件也可以：失败时不会多报一条未处理的拒绝。
   */
  loadURL(url: string): Promise<void>;
  /**
   * 加载一个本地的网页文件。
   *
   * 相对路径相对 App 包（`'JS/web/help.html'`），绝对路径原样用（比如
   * `application.fileSystem.documents + '/pkg/index.html'`）。
   * 返回的 Promise 和 `loadURL` 的一样。
   *
   * 本地网页有两条限制：`<script type="module">` 不执行，`fetch` 读不了
   * 本地文件。
   */
  loadFile(
    filePath: string,
    options?: {
      /** 地址里 `?` 后面的部分，按键值给。 */
      query?: Record<string, string>;
      /** 地址里 `?` 后面的部分，直接给字符串。和 `query` 都给时用这个。 */
      search?: string;
      /** 地址里 `#` 后面的部分。 */
      hash?: string;
    },
  ): Promise<void>;
  /**
   * 在网页里执行一段代码，兑现它的结果。
   *
   * 代码整个是一个表达式时（`'fetch(u).then(r => r.status)'`），结果是
   * Promise 会等它；是多条语句时取最后那个值，不等 Promise。
   * 结果按 JSON 传回来：日期变成字符串，函数和 DOM 节点传不回来。
   * 网页里抛了异常，这个 Promise 就被拒绝。
   */
  executeJavaScript(code: string): Promise<any>;
  /**
   * 给网页发一条消息，网页的预加载脚本用 `ipcRenderer.on(channel, …)` 收。
   * 参数按 JSON 传，带了函数会抛。没人收就丢了。
   */
  send(channel: string, ...args: unknown[]): void;
  /** 这张网页的数据存在哪个 `Session` 里。同一个分区的网页拿到的是同一个对象。 */
  readonly session: Session;
  /** 请求-响应式的消息：`ipc.handle(channel, fn)`。每次读是同一个对象。 */
  readonly ipc: WebContentsIPC;
  /** 现在这张网页的地址。还没加载过是空串。 */
  getURL(): string;
  /** 网页的标题。没有就是空串。 */
  getTitle(): string;
  /** 是不是还在加载。 */
  isLoading(): boolean;
  /** 停掉正在进行的加载。 */
  stop(): void;
  /** 重新加载当前的地址。 */
  reload(): void;
  /**
   * 销毁这张网页，它占的内存跟着放掉。之后除了 `isDestroyed()` 和
   * `close()`，别的方法都抛 `Object has been destroyed`。
   * `WebView` 本身还在，是一个空的视图。
   */
  close(): void;
  /** 是不是已经被 `close()` 销毁了。 */
  isDestroyed(): boolean;
  /** 网页的进程是不是没了。重新加载之后变回 `false`。 */
  isCrashed(): boolean;

  /** 后退和前进。每次读是同一个对象。 */
  readonly navigationHistory: NavigationHistory;
}

/**
 * 一个显示网页的视图。
 *
 * ```js
 * const web = new WebView();
 * web.translatesAutoresizingMaskIntoConstraints = false;
 * page.view.addSubview(web);
 * NSLayoutConstraint.activateConstraints([
 *   web.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
 *   web.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
 *   web.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
 *   web.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
 * ]);
 * web.webContents.loadURL('https://example.com/');
 * ```
 *
 * 它是一个普通的视图：放哪、多大、显示隐藏、圆角，都用 `UIView` 的写法。
 * 网页的事归 `webContents`。
 *
 * **还没加进界面的 `WebView` 要自己拿着引用**。加载可以提前开始（预加载），
 * 但没人引用的 `WebView` 会被回收，网页跟着销毁。加进界面之后不用管。
 *
 * 不在界面里的网页，系统会把它的定时器放慢到每秒一次，`visibilityState`
 * 是 `hidden`。想让它照常跑，就加进界面再把 `isHidden` 设成 `true`。
 */
declare class WebView extends UIView {
  constructor(options?: { webPreferences?: WebPreferences });
  /** 里面那张网页。每次读是同一个对象。 */
  readonly webContents: WebContents;
}

/** `clearStorageData` 的 `storages` 里能写的名字。照 Electron。 */
type SessionStorageType =
  | 'cookies'
  | 'localstorage'
  | 'indexdb'
  | 'serviceworkers'
  | 'cachestorage'
  | 'filesystem'
  | 'shadercache';

/** 一条 cookie。字段照 Electron。 */
interface Cookie {
  readonly name: string;
  readonly value: string;
  /** 它属于哪个域名。以点开头的对子域名也有效。 */
  readonly domain: string;
  /** 只发给 `domain` 这一个主机、不发给子域名时是 `true`。 */
  readonly hostOnly: boolean;
  readonly path: string;
  /** 只在 `https` 的请求里带。 */
  readonly secure: boolean;
  /** 网页的脚本（`document.cookie`）读不到。 */
  readonly httpOnly: boolean;
  /** 没有过期时间。这种 cookie 在 App 重启之后就没了。 */
  readonly session: boolean;
  /** 过期时间，从 1970 年起的秒数。`session` 为 `true` 时没有这个字段。 */
  readonly expirationDate?: number;
  /**
   * 跨站请求带不带。读出来只会是这三种：没写 SameSite 的 cookie，系统读出来
   * 和 `'no_restriction'` 一样。
   */
  readonly sameSite: 'no_restriction' | 'lax' | 'strict';
}

/** `cookies.get` 的筛选条件。都不给就是全部。 */
interface CookieFilter {
  /** 只要这个地址的请求会带上的那些。 */
  url?: string;
  name?: string;
  /** 这个域名的，或者它的子域名的。 */
  domain?: string;
  /** 路径一模一样的。 */
  path?: string;
  secure?: boolean;
  /** `true` 只要会话 cookie，`false` 只要有过期时间的。 */
  session?: boolean;
  httpOnly?: boolean;
}

/** `cookies.set` 的参数。 */
interface CookieDetails {
  /** 这条 cookie 属于哪个地址。必填，要是 `http` 或 `https` 的。 */
  url: string;
  /** 默认空串。 */
  name?: string;
  /** 默认空串。 */
  value?: string;
  /** 给了就对这个域名和它的子域名都有效；不给就只属于 `url` 的主机。 */
  domain?: string;
  /** 默认 `'/'`。 */
  path?: string;
  /** 默认 `false`。 */
  secure?: boolean;
  /** 默认 `false`。 */
  httpOnly?: boolean;
  /** 过期时间，从 1970 年起的秒数。不给就是会话 cookie。 */
  expirationDate?: number;
  sameSite?: 'unspecified' | 'no_restriction' | 'lax' | 'strict';
}

/**
 * 一个分区的 cookie。从 `session.cookies` 拿，不能自己建。
 *
 * ```js
 * const cookies = session.defaultSession.cookies;
 * await cookies.set({ url: 'https://my.app/', name: 'token', value: 'abc' });
 * const list = await cookies.get({ url: 'https://my.app/' });
 * await cookies.remove('https://my.app/', 'token');
 * ```
 */
interface Cookies extends EventTarget {
  /**
   * `'changed'`：这个分区的 cookie 有变化（App 写的、网页写的、服务器写的
   * 都算）。事件上**没有**是哪一条——系统不说，收到之后自己重新 `get`。
   */
  addEventListener(
    type: 'changed',
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(type: 'changed', callback: EventListener | null): void;
  /** 读。条件都不给就是这个分区的全部 cookie。 */
  get(filter?: CookieFilter): Promise<Cookie[]>;
  /** 写一条。同名、同域名、同路径的会被盖掉。 */
  set(details: CookieDetails): Promise<void>;
  /** 删掉这个地址下叫这个名字的 cookie。没有就什么都不发生。 */
  remove(url: string, name: string): Promise<void>;
}

/**
 * 一个存储分区：网页的 cookie、`localStorage`、缓存存在这里。
 *
 * 从全局的 `session` 或者 `webContents.session` 拿，不能自己建。同一个分区
 * 永远是同一个对象。
 */
declare class Session extends NSObject {
  private constructor();
  /** 这个分区的 cookie。每次读是同一个对象。 */
  readonly cookies: Cookies;
  /** 这个分区落不落盘。不带 `persist:` 的分区只在内存里，返回 `false`。 */
  isPersistent(): boolean;
  /**
   * 清数据。什么都不给是整个分区全清，连缓存一起。
   *
   * `origin` 只清这个站点的：系统是按域名记的，不分协议和端口。
   */
  clearStorageData(options?: {
    origin?: string;
    storages?: SessionStorageType[];
  }): Promise<void>;
}

/**
 * 存储分区的入口。不用先建网页。
 *
 * ```js
 * // 打开网页之前先把登录状态写进去
 * await session.defaultSession.cookies.set({
 *   url: 'https://my.app/', name: 'token', value: token, httpOnly: true,
 * });
 * // 退出登录时清掉
 * await session.defaultSession.clearStorageData();
 * ```
 */
declare const session: {
  /** 默认的那一份：不写 `partition` 的网页都用它。 */
  readonly defaultSession: Session;
  /** 某个分区的那一份。写法和 `webPreferences.partition` 一样。 */
  fromPartition(partition: string): Session;
};
