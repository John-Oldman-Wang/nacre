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
