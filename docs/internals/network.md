# 网络

URL 解析怎么做的、fetch 的线程分工、Blob 的零拷贝。

## 解析底子是 `NSURLComponents`

按[能力对齐](../project.md#两层-api)，先无损映射 iOS 的真实能力，而不是自己写一套 WHATWG 的解析状态机。

规范化**全在原生层做完**，JS 侧只做薄包装：

| 这一步 | 怎么做的 |
| --- | --- |
| 点段规范化 `/a/b/../c` → `/a/c` | `NSURL.standardizedURL` |
| scheme 和 host 小写化 | 原生层 `lowercaseString` |
| 默认端口移除 `:443` → `` | 原生层一张表 |

**点段规范化特意用系统 API 而不是在 JS 里写循环**，因为实测发现系统的更对——手写版本很容易把 `//double` 吞成 `/double`，而 WHATWG 要求保留双斜杠。`NSURL.standardizedURL` 连 `/../x` 越界不穿透这种边角都和 WHATWG 对得上。

> 有个顺序要注意：必须**先 `absoluteURL` 再 `standardizedURL`**。对一个相对 URL 直接标准化，NSURL 会先把相对部分自己收干净（`../y` → `y`）再和 base 组合，`new URL('../y', 'https://a.com/a/b/c')` 就会得到 `/a/b/y` 而不是 `/a/y`。

## 性能

实测（iPhone 18 Pro 模拟器，20000 次取平均）：

| | 耗时 |
| --- | --- |
| `new URL(...)` 完整一次 | **20.05 µs** |
| ├ 其中过桥（含 JSON 编解码） | 18.85 µs |
| └ 其中 JS 侧 | 1.2 µs |
| 读 `u.pathname` | 0.05 µs |
| 读 `u.href`（每次重新拼） | 0.15 µs |

**94% 的成本在过桥的 JSON 往返上**，不在 JS 处理。要再快只能改交付方式——让 C++ 直接构造 JS 对象，省掉 JSON 编码和解码两轮。记为 TODO。

属性读取几乎免费（解析结果缓存在 JS 对象里），但**写属性会触发重新解析**（为了保证规范化一致），所以在循环里改 URL 要留意。

## 不做 forbidden header 检查

浏览器禁止 JS 设 `Host`、`Cookie`、`Origin` 这些首部，那是防不受信任的页面伪造请求。按[原则 8](../project.md#原则)，我们的 JS 和原生代码同等地位，没有要防的对象，拦下来只会挡住正当用途。

**会拒绝的只有真正会撕裂报文的东西**：非法的首部名（HTTP token 规则之外的字符）、值里的 NUL / CR / LF。

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

## 一个实现中踩到的坑

signal 在发请求**之前**就已经中止时，要记得把内部那个 Promise 也消化掉：

```js
if (signal.aborted) {
  native.fetchCancel(requestId);
  promise.catch(() => {});     // ← 少了这行就成了未处理的拒绝
  return Promise.reject(signal.reason);
}
```

内部 promise 会被原生层以「取消」拒绝，但它不会交到调用方手里。验收用例里真的报出来了。

## 请求记录的生命周期

原生层给每个请求留一条记录（`NacreFetchTask`：任务、已经收到的字节、错误、谁在等 body），放在 `_fetchTasks` 里按请求 id 查。这条记录什么时候删，分三种情况：

| 请求走到了哪一步 | 谁负责删 | 什么时候 |
| --- | --- | --- |
| 响应头没到就结束了（连不上、超时、被取消） | 原生层自己 | 完成回调里当场删 |
| 响应头到了，JS 拿到了 `Response` | JS 侧的 `FinalizationRegistry` | `Response` 被回收时调 `fetchRelease` |
| 同上，但 body 正在被读 | 同上，只是推后 | 读取期间 `Response` 被 `reading` 集合拿着，结算之后才有资格被回收 |

分界线是记录上的 `responded`：响应头交给 JS 的那一刻置上。在这之前 JS 侧没有 `Response`，也就没有任何东西会来调 `fetchRelease`，所以只能原生层自己删。

所以**一个拿到手却从不读 body 的 `Response`，会把那份数据留在内存里直到被回收**。要尽早释放就读掉 body，或者取消请求。

`fetchRelease` 时请求还没下完的，顺手把任务 `cancel` 掉——不然它会在后台下完，再把数据整个扔掉。

### 这张表是修出来的（2026-11-12）

原来只有第二行那一条规则：「`Response` 被回收就删」。外部审查指出两个洞，都在模拟器上复现了：

**1. 读取期间被回收，Promise 永远不结算。**

```js
const text = await fetch(url).then((res) => res.text());
```

`text()` 返回的 Promise 不持有 `res`，所以它一返回 `res` 就没人拿着了。body 还没下完时 `res` 被回收 → 记录被删 → 下载完成的回调按 id 查不到记录，什么都不做。

实测：对着一个 6 秒才给完的响应（`httpbin.org/drip`），对照组在 3.2 秒被回收，读取的 Promise 等了 15 秒没有结算。修完之后同样的条件下 8 秒照常拿到 60 字节。

修法是 JS 侧在读取期间拿着 `Response`（`reading` 集合），结算后放开。成功、失败、取消三条路原生层都会结算这个调用，所以放开是确定的，不会变成永久持有。

**2. 响应头到达前失败的请求，记录没人删。**

完成回调原来只拒掉 Promise。用一次性的探针打印 `_fetchTasks` 的键，验收用例里那四个注定失败的请求（连 `127.0.0.1:1`、`abort()`、已中止的 signal、`AbortSignal.timeout`）跑完之后一直留在表里；修完之后四个都在完成回调里当场消失。探针没有留在代码里。

这条没有常驻的回归断言：JS 看不到原生那张表，为它开一个口子不值得。

### 对照组为什么用 `FinalizationRegistry`

回归用例要先证明「GC 真的在下载结束之前跑过」，否则通过了也不说明问题。第一版用 `WeakRef` 轮询 `deref()`，对照组**始终不被回收**——`deref()` 会把目标保到当前这一轮任务结束，而增量标记跨着好几轮任务，每一轮都重新保一次。换成 `FinalizationRegistry` 之后就正常了。

另外两条也是这次量出来的：

- 清理回调要等一次**完整** GC，只制造小对象触发不了。用例里每拍分配 96 MB 的类型数组（记在堆外内存上），实测 3 秒左右出一次完整回收。阈值具体是多少没有单独量
- 清理回调是 V8 平台队列里的任务，执行它的 `PumpMessageLoop` 全仓库只有一处调用：`postToJS` 的末尾，也就是原生事件进来的那一轮之后。定时器唤醒和 fetch 的结算都不经过 `postToJS`。用例里靠每拍写一次本地存储触发 `change` 事件来带它。**推论（读代码得出，未实测）**：一个只跑定时器和网络请求、没有其它原生事件的 App，`Response` 的释放会一直攒着

---

← 返回 [API 文档](README.md)

---

← 返回[实现原理](README.md) ・ [API 文档](../api/url.md)

## A16：WebSocket

上层标准，和 `fetch` 一个定位——底下是 `NSURLSessionWebSocketTask`，但那个类**不暴露**。

### 拉 vs 推

原生是 `receiveMessageWithCompletionHandler:`：**收一条就得自己再续一次**。Web 是 `onmessage` 推过来。这层差异由运行时吞掉——`NacreWebSocketReceiveNext()` 在 `didOpenWithProtocol:` 之后启动，每收到一条就递归续上一次，出错就停（那时 `didCompleteWithError` 会把 `close` 发出去）。

### 两处比 Web 多，都是按原则 9 给的

| | 为什么 Web 没有 |
| --- | --- |
| `headers` | 浏览器的 `WebSocket` 构造器只能传子协议，那是 Web 的**历史限制**不是协议的限制。原生的 `webSocketTaskWithRequest:` 收的是 `NSURLRequest`，首部随便设 |
| `ping()` | 协议有 Ping/Pong 帧，但浏览器不给 JS 这个 API。原生给了，而且 RFC 6455 规定对端**必须**回 Pong——不需要服务端应用配合，比应用层心跳强 |

两次都差点照搬 Web 的限制，两次都是被问住才改的。判据写下来免得再犯：**先看 iOS 有没有，再看 Web 怎么做；Web 没有不等于我们不该有。**

### `readyState` 为什么破了枚举规矩

运行时的规矩是「枚举一律用字符串」。这里是**唯一一处例外**：

- Web 的 `readyState` 是 0–3，而且 `WebSocket.OPEN` 这种写法在真实代码里到处都是
- 从 React Native / Web 搬过来的网络层，改这一处的收益为零、成本实打实

例外要写明，否则下一个枚举就会拿它当先例。判据是：**只有「Web 原样兼容本身就是这个 API 的主要价值」时才破例**。`fetch` 的 `method`、`mode` 没破例，因为那些本来就是字符串。

### readyState 自己记，不能用 NSURLSessionTask.state

那个是 `running` / `suspended` / `canceling` / `completed`，和 WebSocket 的 `connecting` / `open` / `closing` / `closed` 不是一回事（比如握手期间和连上之后都是 `running`）。所以每个任务挂一个关联对象记自己的状态。

### 事件负载按形状分支，不按名字

`close` 事件要带三个字段（`code` / `reason` / `wasClean`），而 sink 原来的 `objectEventField` 一个类型只能映一个字段。

改成**按负载的形状**认：带 `wasClean` 的就是关闭事件，带 `tapCount` 的就是触点。不按事件名，因为 `'close'` 这个名字太泛，将来别的对象也会用。

### 实测

| | |
| --- | --- |
| `maximumMessageSize` 默认 | **1048576**（1 MiB） |
| `ws.postman-echo.com/raw` | **收到二进制帧就断连**。第一轮验收用的是它，于是二进制、ping、干净关闭全挂在连锁反应上 |
| `echo.websocket.org` | 文本、二进制、ping、干净关闭全通 |

第一轮那次还暴露了验收用例自己的毛病：ping 和 close 那一组**挂在二进制那步的后面**，二进制一超时它们就不跑了。改成超时也往下走，一个不相干的服务端行为才不会连坐掉四条断言。

**还没实测的**：子协议协商、首部真的到了服务端、`maximumMessageSize` 的效果——公开的 echo 服务都不回显这些。
