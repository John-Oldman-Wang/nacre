// WebView 和 Session
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    EventTarget,
    constructNative,
    define,
    defineNativeClass,
    describeValue,
    has,
    kHandle,
    kSubscribe,
    nativeCall,
    nativeCallAsync,
    nativeClassCall,
    nativeClassCallValue,
    nativeGetObject,
    nativeGetOwned,
    nativeOnly,
    own,
    requireNative,
    subscribeNative,
    toBoolean,
    toNumber,
    toText,
  } = ctx;

  // 这几个定义在后面的 part 里，转发一道（原文整个是一个 IIFE，靠函数提升）
  const filePath = (...a) => ctx.filePath(...a);

  // ---------- WebView ----------
  //
  // 上层标准，和 fetch、WebSocket 一个定位——底下是 WKWebView，但那个类不
  // 暴露。形状照 Electron：
  //
  //   WebView        一个视图。放哪、多大、显示隐藏，用视图自己的写法
  //   webContents    里面那张网页：加载、导航、事件。方法名和事件名照搬
  //                  Electron 的 webContents
  //
  // 和 Electron 不一样的只有一处：事件用 addEventListener 听，数据挂在事件
  // 对象上（e.errorCode），不是 on(name, (event, errorCode) => …) 那样按
  // 位置给参数——和这个运行时里别的事件一致。

  // 后退前进。Electron 把这一组从 webContents 挪到了 navigationHistory
  // （原来的 goBack() 那几个标了废弃），这里直接用新的位置。
  // 不注入全局：它只能从 webContents.navigationHistory 拿到
  // ---- 执行脚本、预加载脚本、消息 ----

  // executeJavaScript 的代码是不是「整个是一个表达式」。是的话原生把它包成
  // return (…) 去执行，结果是 Promise 会等；不是（多条语句）就按程序执行，
  // 取最后的值，不等 Promise。为什么分两种见 NacreWebView.mm。
  //
  // 判断在**运行时自己的引擎**里做：拿它建一个异步函数，建得出来就是表达式。
  // 只解析、不执行，网页不参与——有内容安全策略的网页拦不到这里。
  // 三种开头照 eval 的读法当语句：{ 开头是语句块，function / class 开头是
  // 声明（包进括号会变成表达式，名字就不进全局了）
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  function asExpression(code) {
    // 结尾的分号和空白去掉再试：'fetch(u).then(f);' 是最常见的写法
    const trimmed = code.replace(/[\s;]+$/, '');
    const head = trimmed.trimStart();
    if (head === '' || head[0] === '{' || /^(async\s+function|function|class)\b/.test(head)) {
      return null;
    }
    try {
      new AsyncFunction('return (' + trimmed + '\n)');
      return trimmed;
    } catch (err) {
      return null;
    }
  }

  // 过消息通道的值一律按 JSON 传。JSON.stringify 遇到函数是**悄悄丢掉**，
  // 所以自己查一遍：带不过去的当场抛，别让对面收到一个少了东西的值
  function stringifyForIPC(value, what) {
    return JSON.stringify(value, (key, item) => {
      if (typeof item === 'function' || typeof item === 'symbol') {
        throw new TypeError(what + ': ' + (typeof item) + 's cannot be sent');
      }
      return item;
    });
  }

  // 注入网页的那一段：消息通道在网页里的那一头（ipcRenderer、contextBridge），
  // 加上包在函数里的预加载脚本。**这段代码跑在网页里，不是跑在这个运行时
  // 里**，所以写成一段文本；写法保守一些，不依赖网页的任何全局被改过没有。
  //
  // 预加载脚本拿到的 ipcRenderer / contextBridge 是函数的参数，不是全局——
  // 网页自己的脚本够不着它们，只够得着预加载脚本主动暴露出去的东西。
  // 但这**不是隔离**：预加载脚本和网页在同一个环境里，网页可以改它暴露
  // 的对象，也可以绕过它直接往通道里塞消息。收到的消息当不可信输入对待
  const IPC_BOOTSTRAP_HEAD = `(function () {
  var handler = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nacreIPC;
  if (!handler) return;
  var listeners = new Map();
  function encode(what, value) {
    return JSON.stringify(value, function (key, item) {
      if (typeof item === 'function' || typeof item === 'symbol') {
        throw new TypeError(what + ': ' + (typeof item) + 's cannot be sent');
      }
      return item;
    });
  }
  function post(kind, channel, args) {
    return handler.postMessage(encode('ipcRenderer.' + kind, { kind: kind, channel: String(channel), args: args }));
  }
  function add(channel, listener, once) {
    if (typeof listener !== 'function') throw new TypeError('The listener must be a function');
    var name = String(channel);
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push({ listener: listener, once: once });
    return ipcRenderer;
  }
  function remove(channel, listener) {
    var list = listeners.get(String(channel));
    if (!list) return ipcRenderer;
    for (var i = 0; i < list.length; i++) {
      if (list[i].listener === listener) { list.splice(i, 1); break; }
    }
    return ipcRenderer;
  }
  var ipcRenderer = {
    send: function (channel) {
      post('send', channel, Array.prototype.slice.call(arguments, 1)).catch(function () {});
    },
    invoke: function (channel) {
      return post('invoke', channel, Array.prototype.slice.call(arguments, 1)).then(function (text) {
        return typeof text === 'string' ? JSON.parse(text) : undefined;
      });
    },
    on: function (channel, listener) { return add(channel, listener, false); },
    addListener: function (channel, listener) { return add(channel, listener, false); },
    once: function (channel, listener) { return add(channel, listener, true); },
    off: remove,
    removeListener: remove,
    removeAllListeners: function (channel) {
      if (channel === undefined) listeners.clear(); else listeners.delete(String(channel));
      return ipcRenderer;
    }
  };
  var contextBridge = {
    exposeInMainWorld: function (key, api) {
      if (key in window) throw new Error('Cannot bind an API on top of an existing property on the window object');
      Object.defineProperty(window, key, { value: api, enumerable: true, writable: false, configurable: false });
    }
  };
  Object.defineProperty(window, '__nacreIPCDeliver', {
    value: function (channel, text) {
      var list = listeners.get(channel);
      if (!list) return;
      var args = JSON.parse(text);
      list.slice().forEach(function (entry) {
        if (entry.once) remove(channel, entry.listener);
        try { entry.listener.apply(null, [{ sender: ipcRenderer }].concat(args)); }
        catch (error) { console.error(error); }
      });
    }
  });
  try {
    (function (ipcRenderer, contextBridge) {
`;
  const IPC_BOOTSTRAP_TAIL = `
    })(ipcRenderer, contextBridge);
  } catch (error) {
    post('preload-error', '', [String(error)]).catch(function () {});
  }
})();`;

  // webContents -> 预加载脚本的路径（preload-error 事件要带上）
  const preloadPaths = new WeakMap();
  // webContents -> Map(频道 -> 处理函数)，ipc.handle 登记的
  const ipcHandlers = new WeakMap();
  // webContents -> 它的 ipc 对象
  const ipcObjects = new WeakMap();
  const ipcOwners = new WeakMap();   // ipc 对象 -> webContents

  // webContents.ipc。Electron 里它是一个只管这张网页的 IpcMain；这里只有
  // 请求-响应那一半（handle）。单向的消息走 ipc-message 事件
  class WebContentsIPC {
    constructor(contents) {
      if (contents === undefined || contents[kHandle] === undefined) {
        throw new TypeError('Illegal constructor: this object is created by the runtime, not by new');
      }
      ipcOwners.set(this, contents);
    }
    /** 登记一个频道的处理函数。网页那边 ipcRenderer.invoke 的结果就是它的返回值 */
    handle(channel, listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('handle: the listener must be a function, got ' + describeValue(listener));
      }
      const contents = ipcOwners.get(this);
      let table = ipcHandlers.get(contents);
      if (table === undefined) { table = new Map(); ipcHandlers.set(contents, table); }
      const name = toText(channel);
      if (table.has(name)) {
        throw new Error("Attempted to register a second handler for '" + name + "'");
      }
      table.set(name, listener);
    }
    /** 去掉一个频道的处理函数。没登记过也不报错 */
    removeHandler(channel) {
      const table = ipcHandlers.get(ipcOwners.get(this));
      if (table !== undefined) table.delete(toText(channel));
    }
  }

  // 网页那边 invoke 了一次。找到处理函数、等它的结果、答复回去。
  // **不管走哪条路都要答复**——不答的话网页那边的 Promise 一直挂着
  function answerInvoke(contents, payload) {
    const { id, channel, args } = payload;
    const reply = (ok, value) => {
      // 等结果的这段时间里网页可能已经销毁了，那时答复没有去处，忽略
      try { nativeCall(contents, 'ipcReply', [id, ok, value]); } catch (err) { /* 已销毁 */ }
    };
    const fail = (err) => reply(false, "Error invoking remote method '" + channel + "': " + err);
    const table = ipcHandlers.get(contents);
    const listener = table === undefined ? undefined : table.get(channel);
    if (listener === undefined) {
      fail(new Error("No handler registered for '" + channel + "'"));
      return;
    }
    Promise.resolve()
      .then(() => listener({ sender: contents }, ...args))
      .then((result) => {
        reply(true, result === undefined ? null : stringifyForIPC(result, 'ipc.handle'));
      })
      .catch(fail);
  }

  const historyContents = new WeakMap();   // NavigationHistory -> WebContents
  class NavigationHistory {
    constructor(contents) {
      if (contents === undefined || contents[kHandle] === undefined) {
        throw new TypeError('Illegal constructor: NavigationHistory is created ' +
                            'by the runtime, not by new');
      }
      historyContents.set(this, contents);
    }
    canGoBack() { return nativeCall(historyContents.get(this), 'canGoBack', []); }
    canGoForward() { return nativeCall(historyContents.get(this), 'canGoForward', []); }
    /** 不能后退时是空操作 */
    goBack() { nativeCall(historyContents.get(this), 'goBack', []); }
    goForward() { nativeCall(historyContents.get(this), 'goForward', []); }
  }
  const contentsHistory = new WeakMap();   // WebContents -> NavigationHistory

  const WebContentsClass = defineNativeClass('WebContents', class WebContents extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 事件原生一直在发，订阅只是让原生校验一下名字——写错当场报
    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    /**
     * 加载一个地址。加载完兑现；失败、被 stop() 停掉、被另一次导航顶掉
     * 都拒绝。
     *
     * 和 Electron 一样先挂了一个空的拒绝处理：很多代码不等这个 Promise、
     * 只听事件，失败时不该因此多报一条「未处理的拒绝」。自己 await 或者
     * .catch 的照常拿得到错误
     */
    loadURL(url) {
      const loading = nativeCallAsync(this, 'loadURL', [toText(url)]).then(() => undefined);
      loading.catch(() => {});
      return loading;
    }
    /**
     * 加载一个本地的网页文件。相对路径相对 App 包，绝对路径原样用。
     * options 照 Electron：query（对象）、search（字符串）、hash。两个都给时
     * search 优先。Promise 和 loadURL 的一样
     */
    loadFile(filePath, options) {
      const o = options == null ? {} : options;
      let search = '';
      if (has(o, 'search')) {
        search = toText(o.search);
      } else if (has(o, 'query')) {
        search = new globalThis.URLSearchParams(o.query).toString();
      }
      if (search !== '' && search[0] !== '?') search = '?' + search;
      let hash = has(o, 'hash') ? toText(o.hash) : '';
      if (hash !== '' && hash[0] !== '#') hash = '#' + hash;
      const loading = nativeCallAsync(this, 'loadFile', [toText(filePath), search + hash])
        .then(() => undefined);
      loading.catch(() => {});
      return loading;
    }
    /**
     * 在网页里执行一段代码，兑现它的结果。
     *
     * 代码整个是一个表达式时，结果是 Promise 会等它；是多条语句时取最后
     * 那个值，不等。结果按 JSON 传回来。网页里抛了就拒绝
     */
    executeJavaScript(code) {
      const text = toText(code);
      const expression = asExpression(text);
      return nativeCallAsync(this, 'executeJavaScript',
                             expression === null ? [text, false] : [expression, true])
        // 表达式方式带回来的是 JSON 文本（成员顺序保得住），语句方式是
        // 系统转好的值。两个键都没有就是 undefined
        .then((result) => (typeof result.json === 'string' ? JSON.parse(result.json) : result.value));
    }
    /**
     * 给网页发一条消息。网页的预加载脚本里 ipcRenderer.on(channel, …) 收。
     * 参数按 JSON 传；没人收（没配预加载脚本，或者网页还没开始加载）就丢了
     */
    send(channel, ...args) {
      nativeCall(this, 'send', [toText(channel), stringifyForIPC(args, 'send')]);
    }
    /** 这张网页的数据存在哪个 Session 里。同一个分区的网页拿到的是同一个 */
    get session() { return sessionFor(nativeCall(this, 'getPartition', [])); }
    /** 请求-响应那一半：ipc.handle(channel, fn) */
    get ipc() {
      let ipc = ipcObjects.get(this);
      if (ipc === undefined) {
        ipc = new WebContentsIPC(this);
        ipcObjects.set(this, ipc);
      }
      return ipc;
    }
    /** 现在这张网页的地址。还没加载过是空串 */
    getURL() { return nativeCall(this, 'getURL', []); }
    /** 网页的标题。没有就是空串 */
    getTitle() { return nativeCall(this, 'getTitle', []); }
    isLoading() { return nativeCall(this, 'isLoading', []); }
    /** 停掉正在进行的加载 */
    stop() { nativeCall(this, 'stop', []); }
    reload() { nativeCall(this, 'reload', []); }
    /**
     * 销毁这张网页，它的进程跟着退出。之后除了 isDestroyed() 和 close()，
     * 别的方法都抛。WebView 本身还在，是一个空的视图
     */
    close() { nativeCall(this, 'close', []); }
    isDestroyed() { return nativeCall(this, 'isDestroyed', []); }
    /** 网页的进程是不是没了。重新加载之后变回 false */
    isCrashed() { return nativeCall(this, 'isCrashed', []); }

    get navigationHistory() {
      let history = contentsHistory.get(this);
      if (history === undefined) {
        history = new NavigationHistory(this);
        contentsHistory.set(this, history);
      }
      return history;
    }
  });

  defineNativeClass('WebView', class WebView extends UIView {
    constructor(options) {
      super();
      // 照 Web IDL：字典参数传 null / undefined 视为空，成员是 undefined
      // 视为没带；值在这里转好类型，原生只校验
      const prefs = (options == null || options.webPreferences == null)
        ? {} : options.webPreferences;
      const checked = {};
      if (has(prefs, 'partition')) checked.partition = toText(prefs.partition);
      let preloadPath = null;
      if (has(prefs, 'preload')) {
        // 读出来、查语法、拼好再交给原生。语法在这里查（用运行时自己的
        // 引擎建一个函数，只解析不执行）：注入的那一段是一整个脚本，
        // 预加载脚本有语法错的话它整个不执行，而且**没有任何报错**
        preloadPath = toText(prefs.preload);
        const source = nativeClassCallValue('WebView', 'readPreload:', [preloadPath]);
        try {
          new Function('ipcRenderer', 'contextBridge', source);
        } catch (err) {
          throw new SyntaxError('preload ' + preloadPath + ': ' + (err && err.message));
        }
        checked.preloadScript = IPC_BOOTSTRAP_HEAD + source + IPC_BOOTSTRAP_TAIL;
      }
      constructNative(this, new.target, 'WebView', [checked]);
      // 当场把 webContents 的包装建出来并记上持有。网页一建好原生就开始
      // 发事件，而事件是派发到 webContents 的包装上的——等到第一次读
      // .webContents 才建，就会有事件落在一个没人见过的包装上
      if (this[kHandle] !== undefined) {
        const contents = own(this, 'webContents', nativeGetObject(this, 'webContents'));
        if (preloadPath !== null) preloadPaths.set(contents, preloadPath);
      }
    }

    /** 里面那张网页。每次读是同一个对象 */
    get webContents() {
      requireNative(this, 'webContents');
      return nativeGetOwned(this, 'webContents');
    }
  });

  // ---------- Session：cookie 和清数据 ----------
  //
  // 网页的数据（cookie、localStorage、缓存）按分区存。一个分区一个 Session，
  // 形状照 Electron：
  //
  //   session.defaultSession / session.fromPartition(name)   不用先建网页
  //   webContents.session                                    这张网页用的那一份
  //   ses.cookies.get / set / remove，'changed' 事件
  //   ses.clearStorageData({ storages, origin })
  //
  // 同一个分区永远是同一个 Session 对象（Electron 也是），所以拿它们做 ===
  // 是可以的。对象留到进程结束。
  const sessionCache = new Map();          // 分区名 -> Session
  const sessionCookies = new WeakMap();    // Session -> 它的 Cookies
  const cookiesOwner = new WeakMap();      // Cookies -> Session
  function sessionFor(partition) {
    // 'persist:' 后面什么都没有，等于默认的那一份（原生那边也是这么算的）
    let key = toText(partition);
    if (key === 'persist:') key = '';
    let found = sessionCache.get(key);
    if (found === undefined) {
      found = nativeClassCall('Session', 'fromPartition:', [key]);
      sessionCache.set(key, found);
    }
    return found;
  }

  // http / https 的地址拆成筛 cookie 要用的三样。别的协议不认
  function cookieURL(text, what) {
    let url;
    try {
      url = new globalThis.URL(text);
    } catch (err) {
      throw new TypeError(what + ': the url is invalid');
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new TypeError(what + ': the url must be http or https');
    }
    return { host: url.hostname, path: url.pathname || '/', secure: url.protocol === 'https:' };
  }
  const withoutDot = (domain) => (domain[0] === '.' ? domain.slice(1) : domain);
  // 这条 cookie 会不会发给这个主机。hostOnly 的只认一模一样的主机
  function cookieGoesToHost(cookie, host) {
    const domain = withoutDot(cookie.domain);
    return host === domain || (!cookie.hostOnly && host.endsWith('.' + domain));
  }
  // 路径的匹配照 RFC 6265：一样，或者是它下面的
  function cookieCoversPath(cookiePath, urlPath) {
    if (cookiePath === urlPath) return true;
    if (!urlPath.startsWith(cookiePath)) return false;
    return cookiePath.endsWith('/') || urlPath[cookiePath.length] === '/';
  }
  // 原生给的那一条是个字典，成员顺序不定。按固定的顺序重建一遍，打印出来
  // 每次都一样
  function tidyCookie(raw) {
    const cookie = {
      name: raw.name, value: raw.value, domain: raw.domain, hostOnly: raw.hostOnly,
      path: raw.path, secure: raw.secure, httpOnly: raw.httpOnly, session: raw.session,
    };
    if (raw.expirationDate !== undefined) cookie.expirationDate = raw.expirationDate;
    cookie.sameSite = raw.sameSite;
    return cookie;
  }
  const SAME_SITE_VALUES = ['unspecified', 'no_restriction', 'lax', 'strict'];

  // ses.cookies。它是 EventTarget：'changed' 事件。不注入全局，只能从
  // session 上拿到。方法都是 async 的，所以参数不对是「返回一个被拒绝的
  // Promise」而不是当场抛——返回 Promise 的接口都这样
  class Cookies extends EventTarget {
    constructor(owner) {
      super();
      if (owner === undefined || owner[kHandle] === undefined) {
        throw new TypeError('Illegal constructor: Cookies is created by the runtime, not by new');
      }
      cookiesOwner.set(this, owner);
    }
    // 第一次有人听才让原生去订系统的通知，最后一个走了就退掉
    [kSubscribe](type, on) {
      if (type !== 'changed') {
        throw new TypeError('addEventListener has no value "' + type + '"; expected one of: changed');
      }
      nativeCall(cookiesOwner.get(this), 'observeCookies', [on]);
    }
    /**
     * 读。系统只有「读全部」这一种读法，filter 里的条件在这里筛。
     * 条件照 Electron：url、name、domain、path、secure、session、httpOnly
     */
    async get(filter) {
      const f = filter == null ? {} : filter;
      // url 给了空串等于没给（Electron 的说法：空的就是所有地址）
      const target = has(f, 'url') && toText(f.url) !== ''
        ? cookieURL(toText(f.url), 'cookies.get') : null;
      const raw = await nativeCallAsync(cookiesOwner.get(this), 'cookiesGet', []);
      return raw.map(tidyCookie).filter((cookie) => {
        if (target !== null) {
          // 这个地址的请求会带上的那些：主机对、路径对，secure 的只给 https
          if (!cookieGoesToHost(cookie, target.host)) return false;
          if (!cookieCoversPath(cookie.path, target.path)) return false;
          if (cookie.secure && !target.secure) return false;
        }
        if (has(f, 'name') && cookie.name !== toText(f.name)) return false;
        if (has(f, 'domain')) {
          // 这个域名的，或者它的子域名的
          const want = withoutDot(toText(f.domain));
          const have = withoutDot(cookie.domain);
          if (have !== want && !have.endsWith('.' + want)) return false;
        }
        if (has(f, 'path') && cookie.path !== toText(f.path)) return false;
        if (has(f, 'secure') && cookie.secure !== toBoolean(f.secure)) return false;
        if (has(f, 'session') && cookie.session !== toBoolean(f.session)) return false;
        if (has(f, 'httpOnly') && cookie.httpOnly !== toBoolean(f.httpOnly)) return false;
        return true;
      });
    }
    /**
     * 写一条。url 必填，决定这条 cookie 属于谁；同名同域同路径的会被盖掉。
     * 不给 expirationDate 就是会话 cookie，App 重启就没了
     */
    async set(details) {
      if (details == null || typeof details !== 'object') {
        throw new TypeError('cookies.set needs a details object, got ' + describeValue(details));
      }
      cookieURL(toText(details.url), 'cookies.set');
      const out = {
        name: toText(details.name),
        value: toText(details.value),
        url: toText(details.url),
        path: has(details, 'path') && toText(details.path) !== '' ? toText(details.path) : '/',
        secure: toBoolean(details.secure),
        httpOnly: toBoolean(details.httpOnly),
      };
      if (has(details, 'domain') && toText(details.domain) !== '') {
        // 给了 domain 就补上开头的点：对子域名也有效。不给就只属于 url 的主机
        const domain = toText(details.domain);
        out.domain = domain[0] === '.' ? domain : '.' + domain;
      }
      if (has(details, 'expirationDate')) {
        out.expirationDate = toNumber(details.expirationDate, 'expirationDate');
      }
      if (has(details, 'sameSite')) {
        const sameSite = toText(details.sameSite);
        if (!SAME_SITE_VALUES.includes(sameSite)) {
          throw new TypeError('sameSite has no value "' + sameSite + '"; expected one of: ' +
                              SAME_SITE_VALUES.join(' / '));
        }
        // 另外两种在系统那边都是「不写这个属性」
        if (sameSite === 'lax' || sameSite === 'strict') out.sameSite = sameSite;
      }
      await nativeCallAsync(cookiesOwner.get(this), 'cookiesSet', [out]);
    }
    /** 删掉这个地址下叫这个名字的 cookie。没有就什么都不发生 */
    async remove(url, name) {
      const target = cookieURL(toText(url), 'cookies.remove');
      const wanted = toText(name);
      const raw = await nativeCallAsync(cookiesOwner.get(this), 'cookiesGet', []);
      // 和 get 的 url 条件差一处：这里不看 secure——要删的就是这个地址下的
      // 那一条，不管它当初是不是只给 https
      const doomed = raw.filter((cookie) => cookie.name === wanted &&
                                            cookieGoesToHost(cookie, target.host) &&
                                            cookieCoversPath(cookie.path, target.path));
      if (doomed.length === 0) return;
      await nativeCallAsync(cookiesOwner.get(this), 'cookiesDelete',
                            [doomed.map((c) => ({ name: c.name, domain: c.domain, path: c.path }))]);
    }
  }

  defineNativeClass('Session', class Session extends NSObject {
    constructor() { nativeOnly(new.target); }

    /** 这个分区的 cookie。每次读是同一个对象 */
    get cookies() {
      let jar = sessionCookies.get(this);
      if (jar === undefined) {
        jar = new Cookies(this);
        sessionCookies.set(this, jar);
      }
      return jar;
    }
    /** 这个分区落不落盘。不带 persist: 的那种分区只在内存里 */
    isPersistent() { return nativeCall(this, 'isPersistent', []); }
    /**
     * 清数据。什么都不给是整个分区全清（连缓存一起）。
     *   storages   只清这几类：cookies、localstorage、indexdb……
     *   origin     只清这个站点的。系统是按域名记的，不分协议和端口
     */
    async clearStorageData(options) {
      const o = options == null ? {} : options;
      let storages = null;
      if (has(o, 'storages')) {
        if (o.storages === null || typeof o.storages[Symbol.iterator] !== 'function' ||
            typeof o.storages === 'string') {
          throw new TypeError('clearStorageData: storages must be an array, got ' +
                              describeValue(o.storages));
        }
        storages = Array.from(o.storages, (item) => toText(item));
      }
      let host = null;
      if (has(o, 'origin')) {
        try {
          host = new globalThis.URL(toText(o.origin)).hostname;
        } catch (err) {
          host = '';
        }
        if (host === '') throw new TypeError('clearStorageData: the origin is invalid');
      }
      await nativeCallAsync(this, 'clearData', [storages, host]);
    }
  });

  // 全局的 session。Electron 里它是一个模块（require('electron').session），
  // 这里和 application、performance 一样是一个全局对象
  define(globalThis, 'session', Object.freeze({
    /** 默认的那一份：不写 partition 的网页都用它 */
    get defaultSession() { return sessionFor(''); },
    /** 某个分区的那一份。写法和 webPreferences.partition 一样 */
    fromPartition(partition) { return sessionFor(partition); },
  }));


  // 这个 part 对外提供的东西
  Object.assign(ctx, { WebContentsClass, answerInvoke, preloadPaths, sessionCookies });
})
