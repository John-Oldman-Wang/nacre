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

## 内存：Response 被回收时原生那份数据才放掉

JS 侧的 `Response` 挂在 `FinalizationRegistry` 上，被 GC 回收时通知原生层释放 `NSData`。所以**一个拿到手却从不读 body 的 Response，会把那份数据钉在内存里直到被回收**。

要尽早释放就读掉 body，或者（等 6c 做完）取消请求。

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
