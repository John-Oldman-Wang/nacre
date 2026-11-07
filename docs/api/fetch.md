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
| `blob()` | 同上，而且字节不进 V8 堆 | **零**（还没实现） |
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

验收用例里 20 个并发请求实测 **36ms** 跑完。

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
| `AbortController` | 下一步（6c）。原生层的取消通道已经铺好了 |
| `blob()` | 需要 `Blob` 类，下一步 |
| 重定向和缓存的精细控制 | 用系统默认 |

## 内存：Response 被回收时原生那份数据才放掉

JS 侧的 `Response` 挂在 `FinalizationRegistry` 上，被 GC 回收时通知原生层释放 `NSData`。所以**一个拿到手却从不读 body 的 Response，会把那份数据钉在内存里直到被回收**。

要尽早释放就读掉 body，或者（等 6c 做完）取消请求。

---

← 返回 [API 文档](README.md)
