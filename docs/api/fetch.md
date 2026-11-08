# `fetch` / `Request` / `Response`

```js
const res = await fetch('https://api.example.com/items');
if (!res.ok) throw new Error('HTTP ' + res.status);
const data = await res.json();
```

签名和 Web 一致。**URL 必须是绝对的**——没有 `location` 就没有 base，`fetch('/api')` 会拒绝（见 [URL 文档](url.md#最要紧的差异没有-base)）。

## 最容易误解的一条：404 不会让 fetch 拒绝

```js
const res = await fetch(url + '/404');
res.ok;       // false
res.status;   // 404
// 不抛，不拒绝 —— 服务器正常答复了，只是答复的内容是个错误
```

`fetch` **只在网络层失败时拒绝**：DNS 解析不了、连不上、TLS 握手失败、请求被取消。这是 Web 的语义，我们照搬。

拒绝时给的是真正的 `TypeError`（不是改了 `name` 的 Error），所以 `instanceof TypeError` 成立。

## body 的四条路，代价差很多

| 方法 | 做什么 | 拷贝 |
| --- | --- | --- |
| `arrayBuffer()` | 原生那块内存直接交给 V8 | **零** |
| `blob()` | 字节留在原生侧，JS 只拿句柄 | **零** |
| `text()` | 后台线程 UTF-8 解码 | 一次 |
| `json()` | `text()` 再加 `JSON.parse` | 一次 + 解析 |

零拷贝靠的是 V8 的 `ArrayBuffer::NewBackingStore(data, len, deleter, info)`：V8 直接接管 `NSData` 的内存，GC 回收 ArrayBuffer 时调 deleter 把 `NSData` release 掉。10MB 的响应不会产生 10MB 的拷贝。

> `JSON.parse` 别担心慢——它是 V8 的 C++ builtin，jitless 不影响它。实测 276KB 解析 1.6ms，比一个 40 万次的 JS 循环还快。

### body 只能读一次

```js
await res.json();
await res.json();   // TypeError: body 已经读过了
```

Web 规范如此。读过之后 `res.bodyUsed` 是 `true`。

## 线程分工：实测定下来的

```
NSURLSession 的线程池     DNS/TCP/TLS/传输/gzip，系统的，并行
       ↓
delegate 串行队列         只做最轻的事：追加数据、记状态、一次 dispatch
       ↓
并发队列                  UTF-8 解码这类 CPU 活
       ↓
主线程                    建 V8 对象、兑现 Promise
```

中间那层不是设计出来的，是**被实测逼出来的**。`delegateQueue` 为 `nil` 时系统建的是**串行**队列，20 个并发请求的回调全挤在一个线程上：

| 20 个请求，每个回调做 100ms | 耗时 |
| --- | --- |
| 回调里直接做 | **2179 ms**（全串行） |
| 派到并发队列做 | **166 ms** |
| 用并发 delegateQueue(8) | 334 ms |

下载本身一直是并行的，被串起来的是**回调处理**。所以 delegate 队列上绝不能干活。

> 这组数字是对着本地服务器测的，量的是**回调处理**的串并行差异。验收用例后来改成打公开的 `httpbin.org`，那边的耗时里含真实 RTT（单次约 1.5 s），不能拿来衡量桥的开销。

## 两段式：headers 先到，body 后到

```js
const res = await fetch(url);   // headers 一到就兑现，body 还在下
res.status;                      // 立刻可用
const data = await res.json();   // 这里才等 body
```

实现上走的是 delegate 而不是 `completionHandler`——后者要 body 全下完才回调一次，做不到两段式：

```
didReceiveResponse:  → 兑现 Response 的 Promise
didReceiveData:      → 往缓冲区追加
didCompleteWithError: → 兑现 body 的 Promise
```

## 没有的东西

| | 为什么 |
| --- | --- |
| CORS、同源策略、`credentials`、`mode` | 浏览器为不受信任的页面设计的。[原则 8](../project.md#原则)：我们的 JS 和原生代码同等地位 |
| `ReadableStream`（body 流式） | 一整套规范，第一版不做。body 整个下完才兑现 |
| `FormData` | 还没做 |
| 重定向和缓存的精细控制 | 用系统默认 |

## `Blob`：字节不进 V8 堆

```js
const blob = await (await fetch(url)).blob();
blob.size;                        // 真的
const buf = await blob.arrayBuffer();   // 只有显式要字节时才包成 ArrayBuffer（零拷贝）
```

JS 侧只拿一个句柄，字节留在原生的 `NSData` 里。复用的就是 `UIView` / `UIColor` 那套包装机制——**Chrome 为同样的事要跨进程传 UUID、要配额管理、要落盘，因为它的数据在 browser 进程而 JS 在渲染进程；我们同进程，直接持指针**。

对视频切片这类场景的意义：fetch 一个切片拿到 Blob，交给播放器，字节从头到尾不进 V8 堆。

也能自己造：

```js
new Blob(['前缀-', '后缀'], { type: 'text/plain' });   // size 是 UTF-8 字节数
new Blob([new Uint8Array([1, 2, 3])]);                  // TypedArray 直接过字节
```

第一版**全内存**，不做落盘（Chrome 落盘是因为要扛任意页面的任意 blob，我们是单个 App，大小可控）。嵌套的 Blob（用别的 Blob 拼）也还没做。

## 取消

```js
const ctrl = new AbortController();
const p = fetch(url, { signal: ctrl.signal });
ctrl.abort();                       // p 以 AbortError 拒绝

await fetch(url, { signal: AbortSignal.timeout(5000) });   // 超时自动中止
```

`AbortSignal` 是个 `EventTarget`，中止时派发 `abort` 事件。`AbortSignal.timeout()` 要有定时器才做得了——这也是当初在事件模型那节写「不借 `AbortSignal`，而我们连定时器都没有」的原因，两个前提现在都变了。

**`reason` 的类型是 `unknown`**：任何值都能当中止原因，这是 Web 的语义。默认给的是一个 `name` 为 `'AbortError'` 的 `Error`——Web 那边用 `DOMException`，我们没有那个类。

### 一个实现中踩到的坑

signal 在发请求**之前**就已经中止时，要记得把内部那个 Promise 也消化掉：

```js
if (signal.aborted) {
  native.fetchCancel(requestId);
  promise.catch(() => {});     // ← 少了这行就成了未处理的拒绝
  return Promise.reject(signal.reason);
}
```

内部 promise 会被原生层以「取消」拒绝，但它不会交到调用方手里。验收用例里真的报出来了。

## 内存：Response 被回收时原生那份数据才放掉

JS 侧的 `Response` 挂在 `FinalizationRegistry` 上，被 GC 回收时通知原生层释放 `NSData`。所以**一个拿到手却从不读 body 的 Response，会把那份数据钉在内存里直到被回收**。

要尽早释放就读掉 body，或者（等 6c 做完）取消请求。

---

← 返回 [API 文档](README.md)
