// Blob / AbortController / fetch
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    Event,
    EventTarget,
    URL,
    URLSearchParams,
    define,
    defineNativeClass,
    has,
    kHandle,
    nativeGet,
    requireNative,
    native,
  } = ctx;

  const Blob = defineNativeClass('Blob', class Blob extends NSObject {
    constructor(parts, options) {
      super();
      const list = parts === undefined || parts === null ? [] : Array.from(parts);
      const o = options === undefined || options === null ? {} : options;
      const type = has(o, 'type') ? String(o.type) : '';
      // 字符串走 JSON，ArrayBuffer / TypedArray 的字节按下标单独过去，
      // 嵌套的 Blob 第一版不支持（要先把它的字节取出来）
      const prepared = list.map((item) => {
        if (item instanceof Blob) {
          throw new TypeError('Blob parts cannot be Blobs yet');
        }
        return item;
      });
      // 把 this 交给原生去绑，和 constructNative 一样。不能让原生另建一个
      // 包装、这里只抄句柄的数值——那个包装没人拿着，GC 一回收，句柄和数据
      // 一起没了，而这个 Blob 还活着
      const handle = native.createBlob(prepared, type, this);
      // 建不出来就抛，别留一个没有句柄的空壳
      if (!handle) throw new TypeError('cannot construct Blob from these parts');
      Object.defineProperty(this, kHandle, { value: handle });
    }
    get size() { requireNative(this, 'size'); return nativeGet(this, 'size'); }
    get type() { requireNative(this, 'type'); return nativeGet(this, 'type'); }
    // 字节本来就在内存里，但解码派到后台，所以还是 Promise
    arrayBuffer() { return native.readObjectAsync(this[kHandle], 'arrayBuffer'); }
    text() { return native.readObjectAsync(this[kHandle], 'text'); }
  });

  // ---------- AbortController ----------
  //
  // 当初在事件模型那节写过「不借 AbortSignal，牵出一整套规范，而我们连
  // 定时器都没有」。两个前提都变了：定时器有了，而 NSURLSessionTask.cancel
  // 是实打实的能力，按能力对齐该暴露。

  const kAborted = Symbol('signal.aborted');
  const kReason = Symbol('signal.reason');

  const AbortSignal = define(globalThis, 'AbortSignal',
    class AbortSignal extends EventTarget {
      constructor() {
        super();
        if (!allowAbortSignalConstruct) {
          throw new TypeError('AbortSignal cannot be constructed directly, use new AbortController()');
        }
        this[kAborted] = false;
        this[kReason] = undefined;
      }
      get aborted() { return this[kAborted]; }
      get reason() { return this[kReason]; }
      throwIfAborted() { if (this[kAborted]) throw this[kReason]; }
      /** 已经中止的 signal，省掉建 controller。 */
      static abort(reason) {
        const s = makeSignal();
        abortSignal(s, reason);
        return s;
      }
      /** 到点自动中止。有了定时器之后才做得了这个。 */
      static timeout(ms) {
        const s = makeSignal();
        setTimeout(() => {
          const err = new Error('The operation timed out');
          err.name = 'TimeoutError';
          abortSignal(s, err);
        }, Number(ms) || 0);
        return s;
      }
    });

  let allowAbortSignalConstruct = false;
  function makeSignal() {
    allowAbortSignalConstruct = true;
    try { return new AbortSignal(); }
    finally { allowAbortSignalConstruct = false; }
  }
  function abortSignal(signal, reason) {
    if (signal[kAborted]) return;   // 只中止一次
    signal[kAborted] = true;
    if (reason === undefined) {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';   // Web 用 DOMException，我们没有那个类
      signal[kReason] = err;
    } else {
      signal[kReason] = reason;
    }
    signal.dispatchEvent(new Event('abort'));
  }

  define(globalThis, 'AbortController', class AbortController {
    constructor() {
      Object.defineProperty(this, 'signal', { value: makeSignal(), enumerable: true });
    }
    abort(reason) { abortSignal(this.signal, reason); }
  });

  // ---------- fetch ----------
  //
  // body 的四条路，各自的代价不一样：
  //   arrayBuffer()  原生那块内存直接交给 V8，**零拷贝**
  //   blob()         同上，而且 JS 侧只拿句柄，字节不进 V8 堆
  //   text()         后台 UTF-8 解码，一次拷贝
  //   json()         text 再加一次 JSON.parse（C++ runtime，jitless 不影响）
  //
  // 没有 ReadableStream：body 整个下完才兑现。流式是一整套规范，第一版不做。

  const kRequestId = Symbol('fetch.requestId');
  // 自己构造的 Request / Response 的 body：一个 Blob，或者 null（没有 body）。
  // 从网络来的 Response 不走这里，它的 body 在原生那条请求记录里
  const kBody = Symbol('fetch.body');
  const kBodyUsed = Symbol('fetch.bodyUsed');
  const kResponseInit = Symbol('fetch.responseInit');

  // 请求结束后要放掉原生那份数据。JS 对象被回收时通知原生层——
  // 否则一个没读 body 的 Response 会把 NSData 一直钉在内存里。
  const bodyRegistry = new FinalizationRegistry((requestId) => {
    native.fetchRelease(requestId);
  });

  // 正在读 body 的对象。读取返回的 Promise 不持有 Response，所以
  // `fetch(url).then((res) => res.text())` 里 text() 一返回 res 就没人拿着了。
  // body 还没下完时它被回收，上面那个清理回调会把原生的请求记录删掉，
  // 下载完成时找不到记录，这个 Promise 就永远不结算。
  // 所以读取期间由这里拿着它，结算（成功、失败、取消都算）之后放开。
  const reading = new Set();

  function readBody(target, kind) {
    if (target[kBodyUsed]) {
      // Web 规范：body 只能读一次。读过第二次要抛，不能静默给空的
      return Promise.reject(new TypeError('Body has already been read'));
    }
    const id = target[kRequestId];
    if (!id) return readLocalBody(target, kind);
    target[kBodyUsed] = true;
    const result = native.fetchReadBody(id, kind);
    reading.add(target);
    const done = () => { reading.delete(target); };
    // 两个分支都接住：这条派生出来的 Promise 没人拿，拒绝不接就成了
    // 未处理的拒绝。交给调用方的仍然是 result 本身
    result.then(done, done);
    return result;
  }

  // 自己构造的 Request / Response：body 就在手边的那个 Blob 里
  function readLocalBody(target, kind) {
    const body = target[kBody];
    if (body === null) {
      // 没有 body：照 Web 给空内容，而且不算读过，可以再读
      if (kind === 'text') return Promise.resolve('');
      if (kind === 'blob') return Promise.resolve(new Blob([]));
      return Promise.resolve(new ArrayBuffer(0));
    }
    target[kBodyUsed] = true;
    // Blob 不可变，blob() 直接给同一个
    if (kind === 'blob') return Promise.resolve(body);
    return kind === 'text' ? body.text() : body.arrayBuffer();
  }

  // 构造函数收到的 body → [Blob 或 null, 默认的 Content-Type 或 null]。
  // 照 Web 的「extract a body」：Blob 和字节原样收，其余一律按 String() 转
  // 成 UTF-8 的文字。统一存成 Blob，读取和发送就都只有一条路。
  function extractBody(value) {
    if (value === undefined || value === null) return [null, null];
    if (value instanceof Blob) return [value, value.type === '' ? null : value.type];
    if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
      return [new Blob([value]), null];
    }
    if (value instanceof URLSearchParams) {
      return [new Blob([String(value)]), 'application/x-www-form-urlencoded;charset=UTF-8'];
    }
    return [new Blob([String(value)]), 'text/plain;charset=UTF-8'];
  }

  class Body {
    get bodyUsed() { return this[kBodyUsed]; }
    arrayBuffer() { return readBody(this, 'arrayBuffer'); }
    text() { return readBody(this, 'text'); }
    async json() { return JSON.parse(await readBody(this, 'text')); }
    blob() { return readBody(this, 'blob'); }
  }

  const Response = define(globalThis, 'Response', class Response extends Body {
    constructor(body, init) {
      super();
      const o = init === undefined || init === null ? {} : init;
      this[kRequestId] = 0;
      this[kBodyUsed] = false;
      const [blob, contentType] = extractBody(body);
      this[kBody] = blob;
      const headers = new Headers(o.headers);
      // 自己没给 Content-Type 才补默认的
      if (contentType !== null && !headers.has('content-type')) {
        headers.set('Content-Type', contentType);
      }
      this[kResponseInit] = {
        status: has(o, 'status') ? Number(o.status) : 200,
        statusText: has(o, 'statusText') ? String(o.statusText) : '',
        url: '',
        headers,
      };
    }
    get status() { return this[kResponseInit].status; }
    get statusText() { return this[kResponseInit].statusText; }
    get url() { return this[kResponseInit].url; }
    get headers() { return this[kResponseInit].headers; }
    // 2xx 才算成功。404 也会走到这里——fetch 只在网络层失败时才拒绝，
    // 这是 Web 的语义，常被误解，所以文档里专门写了一段
    get ok() { return this.status >= 200 && this.status < 300; }
    get redirected() { return false; }   // 重定向由系统处理，我们看不到中间过程
    get type() { return 'basic'; }       // 没有 CORS，一律 basic
  });

  const Request = define(globalThis, 'Request', class Request extends Body {
    constructor(input, init) {
      super();
      const o = init === undefined || init === null ? {} : init;
      const fromRequest = input instanceof Request;
      this[kRequestId] = 0;
      this[kBodyUsed] = false;
      this.url = fromRequest ? input.url : new URL(String(input)).href;
      this.method = (has(o, 'method') ? String(o.method) : fromRequest ? input.method : 'GET')
                      .toUpperCase();
      this.headers = new Headers(
        has(o, 'headers') ? o.headers : fromRequest ? input.headers : undefined);
      if (has(o, 'body')) {
        const [blob, contentType] = extractBody(o.body);
        this[kBody] = blob;
        if (contentType !== null && !this.headers.has('content-type')) {
          this.headers.set('Content-Type', contentType);
        }
      } else if (fromRequest) {
        if (input[kBodyUsed]) {
          throw new TypeError('Cannot construct a Request from a Request whose body has already been read');
        }
        // Blob 不可变，两个 Request 共用同一个。首部上面已经从 input 抄过来了
        this[kBody] = input[kBody];
      } else {
        this[kBody] = null;
      }
      // 不 Object.freeze：bodyUsed 是读 body 时才置上的，冻了就写不进去。
      // Web 的 Request 用内部槽存这个状态，我们用 Symbol 属性，所以不能冻。
    }
    clone() {
      if (this[kBodyUsed]) {
        throw new TypeError('Cannot clone a Request whose body has already been read');
      }
      return new Request(this);
    }
  });

  define(globalThis, 'fetch', function fetch(input, init) {
    let req;
    try { req = new Request(input, init); }
    catch (err) { return Promise.reject(err); }

    const headerPairs = [];
    for (const [k, v] of req.headers) headerPairs.push([k, v]);
    const options = {
      method: req.method,
      headers: headerPairs,
    };
    // body 不走 JSON：交过去的是 Blob 的句柄，字节不进 V8 堆、也不用转码
    const body = req[kBody];
    const [promise, requestId] = native.fetchStart(
        req.url, JSON.stringify(options), body === null ? 0 : body[kHandle]);

    // 取消：signal 一中止就叫原生层 cancel，NSURLSessionTask 会以
    // NSURLErrorCancelled 结束，原生层把它映射成 AbortError
    const signal = init && init.signal;
    if (signal) {
      if (signal.aborted) {
        native.fetchCancel(requestId);
        // 内部那个 promise 也会被原生层拒绝（取消），但它不会交到调用方手里，
        // 不自己消化掉就成了未处理的拒绝——验收用例里真的报出来了
        promise.catch(() => {});
        return Promise.reject(signal.reason);
      }
      signal.addEventListener('abort', () => native.fetchCancel(requestId),
                              { once: true });
    }

    return promise.then((info) => {
      const res = new Response(null, {
        status: info.status,
        headers: info.headers,
      });
      res[kResponseInit].url = info.url;
      res[kRequestId] = requestId;
      // 原生那份 NSData 的生死跟着这个 Response 走
      bodyRegistry.register(res, requestId);
      return res;
    });
  });

  // ---------- 定时器 ----------
  //
  // 这是 Web 的 API，不是我们设计的——按[原则 4]所有「我们设计的」异步 API
  // 都返回 Promise，而 setTimeout 是回调式的。提供它是因为它是生态的底座：
  // async/await 降级后的代码、debounce、测试框架全都假设它存在。
  // 要 Promise 形态自己包一行就有：await new Promise(r => setTimeout(r, 100))
  //
  // 调度在原生层：一个按 (到期时间, 注册序号) 排序的最小堆 + 一个唤醒源。
  // 同时到期按注册顺序执行（HTML 规范要求），一次唤醒最多占用主线程 8ms，
  // 超了就让出去让 run loop 去渲染。

})
