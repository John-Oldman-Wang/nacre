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
  // body 有两类读法。
  //
  // 整个读走（四种）：下完才兑现，各自的代价不一样：
  //   arrayBuffer()  原生那块内存直接交给 V8，**零拷贝**
  //   blob()         同上，而且 JS 侧只拿句柄，字节不进 V8 堆
  //   text()         后台 UTF-8 解码，一次拷贝
  //   json()         text 再加一次 JSON.parse（C++ runtime，jitless 不影响）
  //
  // 边下边读：response.body 是一个 ReadableStream，read() 一次给一块。
  // 没人碰 body 的读取器时，四种读法走的还是原来那条路，一行都没变。

  // 一个 Request / Response 的 body 的状态，或者 null（没有 body）。
  // 流对象（ReadableStream）只是它的一个面：没人取 response.body 时流对象
  // 根本不建，但「锁没锁、读没读过」照样记在这里
  const kBody = Symbol('fetch.body');
  const kResponseInit = Symbol('fetch.responseInit');
  const kStreamBody = Symbol('stream.body');
  const kReaderBody = Symbol('reader.body');
  const kReaderClosed = Symbol('reader.closed');
  const kIterator = Symbol('stream.iterator');

  // 请求结束后要放掉原生那份数据。JS 对象被回收时通知原生层——
  // 否则一个没读 body 的 Response 会把 NSData 一直钉在内存里。
  // 请求还没下完的，原生层顺手把它停掉：流读到一半没人要了，走的就是这里
  const bodyRegistry = new FinalizationRegistry((requestId) => {
    native.fetchRelease(requestId);
  });

  // 正在读 body 的对象。读取返回的 Promise 不持有 Response，所以
  // `fetch(url).then((res) => res.text())` 里 text() 一返回 res 就没人拿着了。
  // body 还没下完时它被回收，上面那个清理回调会把原生的请求记录删掉，
  // 下载完成时找不到记录，这个 Promise 就永远不结算。
  // 所以读取期间由这里拿着它，结算（成功、失败、取消都算）之后放开。
  //
  // 流的 read() 不用进这个集合：向原生要下一块时，接结果的那两个回调本身
  // 就引用着 body（body 又拿着 Response），而回调挂在那次调用的 Promise 上，
  // Promise 由引擎的待定调用表拿着，直到结算。没有在途调用的流（读到一半
  // 丢掉的）没有这条链，照样被回收
  const reading = new Set();

  function abortError() {
    const err = new Error('The operation was aborted');
    err.name = 'AbortError';   // Web 用 DOMException，我们没有那个类
    return err;
  }

  // blob：自己构造的 Request / Response 的内容（没有内容时不建状态，kBody 是 null）。
  // requestId：从网络来的 Response，内容在原生那条请求记录里
  function makeBody(owner, blob, requestId) {
    return {
      // 流活着，Response 就得活着：原生那条请求记录的生死跟着 Response 走
      owner,
      blob,
      requestId,
      phase: 'readable',     // 'readable' / 'closed' / 'errored'
      error: undefined,      // phase 是 'errored' 时的那个异常
      locked: false,         // 有读取器拿着，或者被四种读法之一整个读走了
      disturbed: false,      // 读过或者取消过。bodyUsed 就是它
      whole: false,          // 被四种读法之一整个读走：走原来的路，不经过流
      reader: null,          // 现在拿着锁的读取器
      stream: null,          // response.body 第一次被取时才建
      requests: [],          // 在等数据的 read()，按先后
      queue: [],             // 拿到了、还没交给任何 read() 的块（读取器中途放开时才会有）
      pulling: false,        // 有一次向源头要数据的调用在途
      closing: false,        // 源头说没有了，等 queue 里剩下的被读走就关
      spent: false,          // 本地的 Blob 已经给出去了
    };
  }

  // ---- 流的内部操作。都是同步改状态，不抛 ----

  function settleReaderClosed(body, error) {
    const reader = body.reader;
    if (reader === null) return;
    if (body.phase === 'closed') reader[kReaderClosed].resolve(undefined);
    else reader[kReaderClosed].reject(error);
  }

  function closeBody(body) {
    if (body.phase !== 'readable') return;
    body.phase = 'closed';
    body.closing = false;
    for (const request of body.requests.splice(0)) {
      request.resolve({ done: true, value: undefined });
    }
    settleReaderClosed(body, undefined);
  }

  function errorBody(body, error) {
    if (body.phase !== 'readable') return;
    body.phase = 'errored';
    body.error = error;
    body.queue.length = 0;   // 出错之后，还没读走的块不再给（和 Web 一样）
    for (const request of body.requests.splice(0)) request.reject(error);
    settleReaderClosed(body, error);
  }

  // 向源头要下一块。同一时刻最多一次在途
  function pullBody(body) {
    if (body.pulling || body.phase !== 'readable' || body.closing) return;
    body.pulling = true;
    let next;   // Promise<ArrayBuffer | null>，null 表示没有了
    if (body.requestId !== 0) {
      // 一次给当时攒下的全部；一个字节都没有就等到有。请求的第一次 'chunk'
      // 起，原生层开始对这个请求做背压（见 NacreRuntime.mm）
      next = native.fetchReadBody(body.requestId, 'chunk');
    } else if (body.spent || body.blob.size === 0) {
      next = Promise.resolve(null);
    } else {
      // 本地的内容一块给完。Blob 不可变，它的 arrayBuffer() 给的是一份拷贝
      body.spent = true;
      next = body.blob.arrayBuffer();
    }
    next.then((buffer) => {
      body.pulling = false;
      // 等的这段时间里流被取消或者出错了：这一块不要了
      if (body.phase !== 'readable') return;
      if (buffer === null) {
        if (body.queue.length > 0) body.closing = true;
        else closeBody(body);
        return;
      }
      const chunk = new Uint8Array(buffer);
      const request = body.requests.shift();
      if (request !== undefined) request.resolve({ done: false, value: chunk });
      else body.queue.push(chunk);
      if (body.requestId === 0) {
        // 本地的就这一块，给完就到头了
        if (body.queue.length > 0) body.closing = true;
        else closeBody(body);
      } else if (body.requests.length > 0) {
        pullBody(body);
      }
    }, (error) => {
      body.pulling = false;
      errorBody(body, error);
    });
  }

  function readFromBody(body) {
    body.disturbed = true;
    if (body.queue.length > 0) {
      const chunk = body.queue.shift();
      if (body.queue.length === 0 && body.closing) closeBody(body);
      return Promise.resolve({ done: false, value: chunk });
    }
    if (body.phase === 'closed') return Promise.resolve({ done: true, value: undefined });
    if (body.phase === 'errored') return Promise.reject(body.error);
    return new Promise((resolve, reject) => {
      body.requests.push({ resolve, reject });
      pullBody(body);
    });
  }

  function cancelBody(body) {
    body.disturbed = true;
    if (body.phase === 'closed') return Promise.resolve(undefined);
    if (body.phase === 'errored') return Promise.reject(body.error);
    body.queue.length = 0;
    closeBody(body);   // 在等的 read() 以 done 结束，不是被拒
    if (body.requestId !== 0) {
      // 内容不会再有人读了：停掉请求，原生那份数据现在就放掉，不等 Response
      // 被回收。在途的那次要数据的调用由原生层结算（不结算的话，上面说的那条
      // 链会一直拿着 Response），这里已经不看它的结果
      bodyRegistry.unregister(body.owner);
      native.fetchRelease(body.requestId);
    }
    body.blob = null;
    return Promise.resolve(undefined);
  }

  // signal 中止了。流还能读的话让它出错：在等的 read() 被拒，之后的也被拒。
  // 给的是 AbortError，和 fetch() 本身被中止时一致（不是 signal.reason）。
  // 被四种读法之一整个读走的不归这里管，那条路由原生层拒绝
  function abortBody(body) {
    if (body.whole) return;
    errorBody(body, abortError());
  }

  const ReadableStreamDefaultReader = define(globalThis, 'ReadableStreamDefaultReader',
    class ReadableStreamDefaultReader {
      constructor(stream) {
        const body = stream instanceof ReadableStream ? stream[kStreamBody] : undefined;
        if (body === undefined) {
          throw new TypeError('ReadableStreamDefaultReader needs a ReadableStream');
        }
        if (body.locked) {
          throw new TypeError('This ReadableStream is locked: it already has a reader, or its body has been read');
        }
        body.locked = true;
        body.reader = this;
        this[kReaderBody] = body;
        let resolve;
        let reject;
        const promise = new Promise((a, b) => { resolve = a; reject = b; });
        // closed 没人接也不算未处理的拒绝：它是一个状态，不是一次调用的结果
        promise.catch(() => {});
        this[kReaderClosed] = { promise, resolve, reject };
        if (body.phase === 'closed') resolve(undefined);
        else if (body.phase === 'errored') reject(body.error);
      }
      get closed() { return this[kReaderClosed].promise; }
      read() {
        const body = this[kReaderBody];
        if (body === null) return Promise.reject(new TypeError('This reader has been released'));
        return readFromBody(body);
      }
      cancel(reason) {
        const body = this[kReaderBody];
        if (body === null) return Promise.reject(new TypeError('This reader has been released'));
        return cancelBody(body);
      }
      releaseLock() {
        const body = this[kReaderBody];
        if (body === null) return;
        const released = new TypeError('This reader has been released');
        // 还在等的 read() 被拒。已经向源头要的那一块到了之后进 queue，
        // 留给下一个读取器
        for (const request of body.requests.splice(0)) request.reject(released);
        if (body.phase === 'readable') {
          this[kReaderClosed].reject(released);
        } else {
          const promise = Promise.reject(released);
          promise.catch(() => {});
          this[kReaderClosed] = { promise, resolve() {}, reject() {} };
        }
        body.reader = null;
        body.locked = false;
        this[kReaderBody] = null;
      }
    });

  // for await 用的迭代器。挂在 %AsyncIteratorPrototype% 下面，所以它自己也能
  // 放进 for await。next 和 return 排着队执行：前一个没结算，后一个不开始
  const AsyncIteratorPrototype = Object.getPrototypeOf(
      Object.getPrototypeOf((async function* () {}).prototype));
  const StreamIteratorPrototype = Object.setPrototypeOf({
    next() {
      const state = this[kIterator];
      const step = () => {
        if (state.finished) return Promise.resolve({ done: true, value: undefined });
        return state.reader.read().then((result) => {
          if (!result.done) return result;
          state.finished = true;
          state.reader.releaseLock();
          return { done: true, value: undefined };
        }, (error) => {
          state.finished = true;
          state.reader.releaseLock();
          throw error;
        });
      };
      state.ongoing = state.ongoing === null ? step() : state.ongoing.then(step, step);
      return state.ongoing;
    },
    // 提前 break 走的是这里：取消这个流（请求跟着停掉），放开锁
    return(value) {
      const state = this[kIterator];
      const step = () => {
        if (state.finished) return Promise.resolve({ done: true, value });
        state.finished = true;
        if (state.preventCancel) {
          state.reader.releaseLock();
          return Promise.resolve({ done: true, value });
        }
        const cancelled = state.reader.cancel(value);
        state.reader.releaseLock();
        return cancelled.then(() => ({ done: true, value }));
      };
      state.ongoing = state.ongoing === null ? step() : state.ongoing.then(step, step);
      return state.ongoing;
    },
  }, AsyncIteratorPrototype);

  const ReadableStream = define(globalThis, 'ReadableStream', class ReadableStream {
    constructor() {
      throw new TypeError(
          'ReadableStream cannot be constructed yet: the only streams are the ones response.body gives you');
    }
    get locked() { return this[kStreamBody].locked; }
    cancel(reason) {
      const body = this[kStreamBody];
      if (body.locked) {
        return Promise.reject(new TypeError('Cannot cancel a ReadableStream that is locked'));
      }
      return cancelBody(body);
    }
    getReader(options) {
      const o = options === undefined || options === null ? {} : options;
      if (has(o, 'mode')) {
        throw new TypeError('getReader() does not take a mode: BYOB readers are not supported');
      }
      return new ReadableStreamDefaultReader(this);
    }
    values(options) {
      const o = options === undefined || options === null ? {} : options;
      const iterator = Object.create(StreamIteratorPrototype);
      iterator[kIterator] = {
        reader: new ReadableStreamDefaultReader(this),   // 这一刻就锁住，锁着就抛
        preventCancel: has(o, 'preventCancel') ? Boolean(o.preventCancel) : false,
        finished: false,
        ongoing: null,
      };
      return iterator;
    }
  });
  // 和 Web 一样：这两个名字是同一个函数
  define(ReadableStream.prototype, Symbol.asyncIterator, ReadableStream.prototype.values);

  // 整个读走：四种读法共用。照 Web：流被锁住或者读过了就拒绝；否则把它锁住、
  // 记成读过，然后走原来的路（不经过流，arrayBuffer() 还是零拷贝）
  function readBody(target, kind) {
    const body = target[kBody];
    if (body === null) {
      // 没有 body：照 Web 给空内容，而且不算读过，可以再读
      if (kind === 'text') return Promise.resolve('');
      if (kind === 'blob') return Promise.resolve(new Blob([]));
      return Promise.resolve(new ArrayBuffer(0));
    }
    if (body.disturbed) {
      // Web 规范：body 只能读一次。读过第二次要抛，不能静默给空的
      return Promise.reject(new TypeError('Body has already been read'));
    }
    if (body.locked) {
      return Promise.reject(new TypeError('Body is locked: response.body has a reader'));
    }
    body.disturbed = true;
    body.locked = true;
    body.whole = true;
    if (body.requestId === 0) {
      // 自己构造的 Request / Response：内容就在手边的那个 Blob 里。
      // Blob 不可变，blob() 直接给同一个
      if (kind === 'blob') return Promise.resolve(body.blob);
      return kind === 'text' ? body.blob.text() : body.blob.arrayBuffer();
    }
    const result = native.fetchReadBody(body.requestId, kind);
    reading.add(target);
    const done = () => { reading.delete(target); };
    // 两个分支都接住：这条派生出来的 Promise 没人拿，拒绝不接就成了
    // 未处理的拒绝。交给调用方的仍然是 result 本身
    result.then(done, done);
    return result;
  }

  const bodyUsed = (target) => target[kBody] !== null && target[kBody].disturbed;

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
    get bodyUsed() { return bodyUsed(this); }
    arrayBuffer() { return readBody(this, 'arrayBuffer'); }
    text() { return readBody(this, 'text'); }
    async json() { return JSON.parse(await readBody(this, 'text')); }
    blob() { return readBody(this, 'blob'); }
  }

  const Response = define(globalThis, 'Response', class Response extends Body {
    constructor(body, init) {
      super();
      const o = init === undefined || init === null ? {} : init;
      const [blob, contentType] = extractBody(body);
      this[kBody] = blob === null ? null : makeBody(this, blob, 0);
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
    // 内容的流。没有内容的响应是 null。流对象第一次取的时候才建，
    // 之后每次给同一个
    get body() {
      const body = this[kBody];
      if (body === null) return null;
      if (body.stream === null) {
        const stream = Object.create(ReadableStream.prototype);
        Object.defineProperty(stream, kStreamBody, { value: body });
        body.stream = stream;
      }
      return body.stream;
    }
  });

  // Request 带着的取消信号。存的就是构造时给的那一个对象（没给是 null），不像
  // Web 那样另建一个跟着它的：fetch 直接在这个对象上挂监听器，和 signal 写在
  // fetch 第二个参数里时走的是同一条路，寿命上的考虑（监听器只弱引用 body）也
  // 就不用再想一遍。和 Web 的差别只有 request.signal === controller.signal
  const kSignal = Symbol('request.signal');
  // 没给 signal 时，读 request.signal 给的那个不会中止的。读的时候才建
  const kIdleSignal = Symbol('request.idleSignal');

  const Request = define(globalThis, 'Request', class Request extends Body {
    constructor(input, init) {
      super();
      const o = init === undefined || init === null ? {} : init;
      const fromRequest = input instanceof Request;
      this.url = fromRequest ? input.url : new URL(String(input)).href;
      this.method = (has(o, 'method') ? String(o.method) : fromRequest ? input.method : 'GET')
                      .toUpperCase();
      this.headers = new Headers(
        has(o, 'headers') ? o.headers : fromRequest ? input.headers : undefined);
      // signal：init 里带了以 init 的为准，null 是「不要」；没带就沿用 input 的。
      // 对象参数不转换，不是 AbortSignal 就抛
      if (has(o, 'signal')) {
        if (o.signal !== null && !(o.signal instanceof AbortSignal)) {
          throw new TypeError('Request: signal must be an AbortSignal or null');
        }
        this[kSignal] = o.signal;
      } else {
        this[kSignal] = fromRequest ? input[kSignal] : null;
      }
      this[kIdleSignal] = null;
      if (has(o, 'body')) {
        const [blob, contentType] = extractBody(o.body);
        this[kBody] = blob === null ? null : makeBody(this, blob, 0);
        if (contentType !== null && !this.headers.has('content-type')) {
          this.headers.set('Content-Type', contentType);
        }
      } else if (fromRequest) {
        if (bodyUsed(input)) {
          throw new TypeError('Cannot construct a Request from a Request whose body has already been read');
        }
        // Blob 不可变，两个 Request 共用同一个。首部上面已经从 input 抄过来了
        this[kBody] = input[kBody] === null ? null : makeBody(this, input[kBody].blob, 0);
      } else {
        this[kBody] = null;
      }
      // 不 Object.freeze：「读没读过」是读 body 时才记上的，冻了就写不进去。
      // Web 的 Request 用内部槽存这个状态，我们用 Symbol 属性，所以不能冻。
    }
    // 照 Web，signal 一定有：没给的时候是一个永远不会中止的
    get signal() {
      if (this[kSignal] !== null) return this[kSignal];
      if (this[kIdleSignal] === null) this[kIdleSignal] = makeSignal();
      return this[kIdleSignal];
    }
    clone() {
      if (bodyUsed(this)) {
        throw new TypeError('Cannot clone a Request whose body has already been read');
      }
      return new Request(this);   // signal 跟着过去
    }
  });

  // 照 Web：这几个状态码的响应没有内容，body 是 null（HEAD 的响应也是）
  const NULL_BODY_STATUS = new Set([101, 103, 204, 205, 304]);

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
    const sent = req[kBody];
    const [promise, requestId] = native.fetchStart(
        req.url, JSON.stringify(options), sent === null ? 0 : sent.blob[kHandle]);

    // 取消：signal 一中止就叫原生层 cancel，NSURLSessionTask 会以
    // NSURLErrorCancelled 结束，原生层把它映射成 AbortError
    // signal 从最终的那个 Request 上取：init 里写了的和 input（是 Request 时）
    // 带着的，上面 new Request(input, init) 已经按规则合成一个了
    const signal = req[kSignal];
    // 响应的 body，弱引用：监听器挂在 signal 上，signal 可能活得比这次请求
    // 久得多，不能因为它把 Response 留住（留住了原生那份数据就一直不放）
    let bodyRef = null;
    if (signal !== null) {
      if (signal.aborted) {
        native.fetchCancel(requestId);
        // 内部那个 promise 也会被原生层拒绝（取消），但它不会交到调用方手里，
        // 不自己消化掉就成了未处理的拒绝——验收用例里真的报出来了
        promise.catch(() => {});
        return Promise.reject(signal.reason);
      }
      signal.addEventListener('abort', () => {
        native.fetchCancel(requestId);
        const body = bodyRef === null ? undefined : bodyRef.deref();
        if (body !== undefined) abortBody(body);
      }, { once: true });
    }

    return promise.then((info) => {
      const res = new Response(null, {
        status: info.status,
        headers: info.headers,
      });
      res[kResponseInit].url = info.url;
      if (req.method !== 'HEAD' && !NULL_BODY_STATUS.has(info.status)) {
        const body = makeBody(res, null, requestId);
        res[kBody] = body;
        if (signal !== null) bodyRef = new WeakRef(body);
      }
      // 原生那份 NSData 的生死跟着这个 Response 走。第三个参数是取消登记用的：
      // 流被 cancel() 时当场放掉，就不用再等回收
      bodyRegistry.register(res, requestId, res);
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
