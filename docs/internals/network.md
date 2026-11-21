# 网络

URL 解析怎么做的、fetch 的线程分工、字节怎么交给 JS（哪些零拷贝、哪些拷一份）、边下边读和背压怎么做的。

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
| 同上，body 的流被 `cancel()` 了 | JS 侧当场 | `cancel()` 里直接调 `fetchRelease`，不等回收，见[边下边读](#边下边读responsebody) |

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


## `Blob.arrayBuffer()` 拷一份

（2026-11-16 改的，来源是一份外部审查，先在运行时里复现过。）

原来 `blob.arrayBuffer()` 是零拷贝：把 Blob 自己那块 `NSData` 的内存直接交给 V8 当 `ArrayBuffer` 的存储。问题是 `ArrayBuffer` 可写，而 Blob 应当不可变。探针量到的：

```js
const blob = new Blob(['hello']);
const first = await blob.arrayBuffer();
new Uint8Array(first)[0] = 0x58;
await blob.text();          // 'Xello'，Blob 的内容被改了
```

两次读出来的还是同一块内存，改一个另一个跟着变。同一个 Blob 还可能正被当成请求体发出去，或者被 `clone()` 出来的另一个 `Response` 共用。

现在这条路在后台队列上 `malloc` 加 `memcpy`，把拷贝交给 V8，回收时 `free`。拷贝不在主线程上做。

**哪些路还是零拷贝**，判据是「交出去的那块内存有没有第二个使用者」：

| 读法 | 内存从哪来 | 拷不拷 |
| --- | --- | --- |
| `blob.arrayBuffer()` | Blob 自己的存储，Blob 还活着、还能再读 | 拷 |
| 自己构造的 `Request` / `Response` 的 `arrayBuffer()` | 它的 body 是一个 Blob，走上一行 | 拷 |
| `fetch` 回来的 `Response` 直接 `arrayBuffer()` | 读的那一刻从请求记录里复制出来的一份（`[entry.body copy]`），body 只能读一次 | 不拷，直接交 |
| `fetch` 回来的 `Response` 用 `body` 的 `read()` | 请求记录里攒着的那块缓冲区，整块交出去，记录换一块新的接着攒 | 不拷，直接交 |
| 自己构造的 `Response` 用 `body` 的 `read()` | 它的 Blob，走第一行 | 拷 |
| `application.fileSystem.readBytes()` | 刚从文件读出来的一块，没有别人拿着 | 不拷，直接交 |

所以大文件要逐字节处理时，`fetch` 之后直接 `arrayBuffer()` 比先 `blob()` 再 `arrayBuffer()` 少一次拷贝。

内存不够拷的时候 Promise 以 `RangeError` 拒绝。

## 本地 body：统一存成 Blob

自己构造的 `Request` / `Response` 的 body 不在原生那条请求记录里（它们没有请求 id），所以要另外存。存法只有一种：**一个 `Blob`，或者 `null`**。

```
构造函数收到的 body ──extractBody──▶ [Blob 或 null, 默认的 Content-Type 或 null]

  null / undefined              → null
  Blob                          → 原样（type 非空时当默认 Content-Type）
  ArrayBuffer / 类型数组         → new Blob([字节])
  URLSearchParams               → new Blob([String(它)])，form-urlencoded
  其它一切                       → new Blob([String(它)])，text/plain
```

这是 Web 的「extract a body」那张表，少了 `FormData` 和 `ReadableStream` 两行。「其它一切按 `String()` 转」也是它的规定，和[参数转换](conversion.md)的字符串那一行是同一条规则。

统一成 `Blob` 之后三件事都只剩一条路：

| | 怎么做 |
| --- | --- |
| 读 | `text()` / `arrayBuffer()` 转给那个 `Blob` 自己的方法；`blob()` 直接把它交出去（`Blob` 不可变，所以它的 `arrayBuffer()` 给的是一份拷贝，见[下面](#blobarraybuffer-拷一份)） |
| 发 | `fetchStart` 多收一个参数：`Blob` 的句柄。原生层取它的 `NSData` 直接当 `HTTPBody`，不拷贝。原来 body 是塞在 options 的 JSON 里的字符串，那条路删了 |
| 复制 | `clone()` 和 `new Request(request)` 共用同一个 `Blob` |

原生层只认 `Blob`：给的不是就拒绝（`fetch body must be a Blob`）。转换全在 JS 一侧，这也是参数转换那套分工。

### 这是修出来的（2026-11-12）

外部审查指出 `new Request(url, { body: 'hello' }).text()` 和 `new Response('hello').text()` 都被拒绝：读取只认请求 id，自己构造的是 0；`Response` 的构造函数根本没存 body。加了 48 条断言，修之前失败 35 条。

顺带量到修之前的发送行为，都是静默的错：

| `body` | 修之前服务器收到的 |
| --- | --- |
| `new Uint8Array([0, 255, 16, 128])` | 文字 `0,255,16,128` |
| `ArrayBuffer` | 文字 `[object ArrayBuffer]` |
| `Blob` | 文字 `[object Blob]`（读代码得出，没有单独量） |

### 没有 body 时照 Web 给空内容

`new Response().text()` 得到 `''`，`bodyUsed` 保持 `false`。原来是拒绝 `This object has no body`，并且先把 `bodyUsed` 置成了 `true`——一个从来没有内容的对象显示「读过了」。

### 默认的 Content-Type，以及一个改不掉的差异

Web 规定没写 `Content-Type` 时按 body 的种类补默认值，字符串是 `text/plain;charset=UTF-8`。这一条照做了，在 JS 侧往 `Headers` 里补。

**这改变了已有的行为**：原来字符串 body 不写 `Content-Type` 时，发出去的是 `application/x-www-form-urlencoded`。那不是我们选的，是 `NSURLSession` 在有 `HTTPBody` 而没有 `Content-Type` 时自己填的（实测：`httpbin` 把 `hello` 解析成了一个表单字段，`data` 是空的）。

同一个机制留下一处和 Web 不一样的地方：`ArrayBuffer` 和类型数组在 Web 上不发 `Content-Type`，而我们拦不住系统去填那个表单类型。实测服务器真的把四个字节当表单解析了。所以文档里要求发二进制时自己写 `Content-Type`。没有替用户补一个 `application/octet-stream`——那是又发明一条 Web 没有的规则。

### 两处比 Web 宽

- **带 body 的 `Request` 可以用于多次 `fetch`。** Web 上 `fetch(req)` 会把 `req` 的 body 标成读过，第二次就抛。我们的 body 是不可变的 `Blob`，共用没有代价，所以没有标。**未在模拟器验证**（验收里只发了一次）
- **`GET` / `HEAD` 带 body 不抛。** Web 在构造 `Request` 时就拒绝。这个原来就没检查，这次没有动

读过之后的 `clone()` 和 `new Request(读过的)` 是照 Web 抛的。

## `Request` 带着的 `signal`

（2026-11-17，来自一份外部审查。）`Request` 原来不保存 `signal`，`fetch()` 只看自己第二个参数里的那个。于是 `fetch(new Request(url, { signal }))` 之后中止，请求不会被取消。验收里复现过：对着一个 8 秒后才有内容的地址这样发请求，200 毫秒后中止，3 秒内 `fetch()` 没有结果，服务端也没看到连接断开。

现在的规则照 Web：

| | |
| --- | --- |
| `new Request(url, { signal })` | 存下这个 `signal` |
| `new Request(request)`、`request.clone()` | 沿用原来那个 |
| `new Request(request, { signal: other })` | 换成 `other` |
| `new Request(request, { signal: null })` | 去掉 |
| `{ signal: undefined }` | 视为没写，和别的选项一样 |
| 不是 `AbortSignal` 也不是 `null` | `TypeError`。对象参数不转换 |
| `fetch(input, init)` | 先 `new Request(input, init)`，再用这个 `Request` 上的 `signal`。所以上面几条对 `fetch()` 的两个参数同样成立 |

`fetch(url, { signal })` 这条原来的路没有变：`init.signal` 存进 `Request` 再取出来，是同一个对象。

### 存的是给的那个对象，不另建一个

Web 上 `request.signal` 是 `Request` 自己的一个信号，它跟着构造时给的那个中止，所以 `request.signal !== controller.signal`。我们存的就是给的那个对象，`request.signal === controller.signal`。

没有照做的原因是寿命。跟随要在原来的信号上挂一个监听器去中止新的信号，这个监听器要么强引用新信号（一个长期使用的 `controller` 上会越积越多），要么弱引用（请求还在途中、新信号却可能已经被回收，中止传不过去）。Web 的规范为此专门有一套「还有人在听就不能回收」的规则。直接存原来的对象，`fetch()` 挂监听器的地方和 `signal` 写在第二个参数里时完全相同，[那边定好的寿命规则](#生命周期)不用再想一遍。

代价是上面那一处身份上的差别。依赖「两个不是同一个对象」的代码没有见过。

没给 `signal` 时，`request.signal` 读到的是一个不会中止的 `AbortSignal`（Web 也是一定有）。它在第一次读的时候才建，不参与沿用：`new Request(request)` 沿用的是「没有」，不是这个对象。

### 一处顺带变了的行为

`fetch(url, { signal: 1 })` 原来是当场抛（往数字上调 `addEventListener`），而且那时请求已经发出去了。现在在构造 `Request` 时就被拦下，`fetch()` 返回一个以 `TypeError` 被拒绝的 `Promise`，请求不发。

## 边下边读：`response.body`

（2026-11-16 加的。在这之前响应内容要整个下完才能读。）

`response.body` 是 Web 的 `ReadableStream`，只做了读的那一半里最小的一组：`getReader()`、`locked`、`cancel()`、`for await`，读取器的 `read()` / `cancel()` / `releaseLock()` / `closed`。每一块是 `Uint8Array`。没做的成员不存在；`new ReadableStream()` 抛 `TypeError`。

### 数据怎么走

```
系统的回调（delegate 队列）   didReceiveData
       ↓ 一次 dispatch
_fetchQueue（串行）            追加进这个请求的缓冲区 ← 唯一的一次拷贝
       ↓ JS 调了 read() 才有这一步
主线程                         整块缓冲区交给 V8 当 ArrayBuffer 的存储（不拷贝），兑现 read()
```

**是 JS 来要，不是原生往上推。** `read()` 在 JS 里排队，队头的那个向原生要一次：`native.fetchReadBody(requestId, 'chunk')`。原生的回答只有三种：

| 请求记录的状态 | 回答 |
| --- | --- |
| 缓冲区里有字节 | 整块交出去（`SettleBytes`），记录换一块空的接着攒 |
| 一个字节都没有，请求还在跑 | 记下这次调用，下一次 `didReceiveData` 追加完就交 |
| 一个字节都没有，请求结束了 | 成功：`null`（`SettleJSON`），JS 把流关掉。失败：拒绝，取消的是 `AbortError`，其余是 `TypeError` |

这样定有三个后果，都是想要的：

- **引擎一行没改。** `'chunk'` 是读 body 那条通道（`fetch_read_body`）上多的一种 kind，兑现用的是已有的 `SettleBytes` / `SettleJSON` / `RejectCall`。同一批里别的改动也在动 `Engine.cpp`，这一步不碰它。
- **回主线程的次数不超过 `read()` 的次数。** 一块一次会不会太碎，取决于 JS 读得多快：JS 一轮读取（回主线程、兑现、微任务、再发下一次调用）期间到达的数据都攒在缓冲区里，下一次一起给。主线程越忙，块越大、次数越少，不需要另设定时器来合并。系统一次回调给 16 KB 到 128 KB（见下面的实测），所以读得最勤的时候也就是这个粒度。
- **原生不用知道「流」。** 锁、读取器、`closed`、迭代器全在 JS 里；原生只有「攒」和「交」。

**拷贝只有一次**，就是 `_fetchQueue` 上追加进缓冲区的那一次，不在主线程上。系统给的 `NSData` 可能是不连续的几段，要么在这里拼起来，要么一段一段分别交给 JS（那样每段都要回一次主线程）。选了前者。交给 V8 的那一步不拷：整块 `NSMutableData` 的所有权转给 `BackingStore`，它之后没有别的使用者，符合[上面那张表](#blobarraybuffer-拷一份)的判据。

**出错优先于剩下的字节。** 请求失败之后，缓冲区里还没读走的那一截不再给，下一次 `read()` 直接被拒绝。Web 的流出错时也会丢掉队列里的块。

### 背压

请求记录上多两个标志：`streaming`（JS 按块读过这个请求）和 `suspended`（任务被我们暂停了）。规则只有两条，都在 `_fetchQueue` 上执行：

- `didReceiveData` 追加之后：`streaming` 为真、没有 `read()` 在等、缓冲区到了 **1 MiB** → `[task suspend]`。
- 交出一块之后：任务是暂停着的 → `[task resume]`。

没有「低水位」：一次 `read()` 取走的是缓冲区里的全部，取走之后必然是空的，所以取走就继续。

**读不读、什么时候读由 JS 定，原生只管攒多了先别收。** 这条线是按原生层边界划的：暂停和继续是运行时的机制；原生不替 JS 决定读多少、要不要取消。

**没按块读过的请求不做背压。** 浏览器从响应一开始就限制缓冲。我们不这样做：`const res = await fetch(url); …; await res.arrayBuffer()` 这种写法里，下载在两个 `await` 之间一直在进行，一开始就限制的话大响应会停在 1 MiB 等 `arrayBuffer()` 来了再继续，改变了已有的行为。代价是一个拿到手却不读的 `Response` 仍然会把内容全部收进内存，和原来一样。

**1 MiB 的依据：**

| | |
| --- | --- |
| 比一次回调大得多 | 实测一次回调 16 KB 到 128 KB，攒满要 8 到 64 次回调。读得跟得上的流碰不到这条线，不会来回暂停、继续 |
| 攒满要的时间比 JS 一轮读取长 | 100 Mbps（12.5 MB/s）约 80 ms 攒满 |
| 读得慢的流占的内存有上限 | 每个流最多这么多，外加暂停生效之前系统已经收下的 |

这个数没有外部依据可以直接照搬：Chromium 给响应体用的管道也有一个默认容量，但具体数值没查证，不引用。和仓库里已有的一个量级对得上的是 WebSocket 的 `maximumMessageSize` 默认 1 MiB。

**实测（macOS 27，原生探针直接用 `NSURLSession`，对着本机的测试服务）。** 动手之前查到两条让人不放心的说法：Apple 文档说 `suspend` 之后「下载任务可以接着传，其它任务恢复时要从头再来」；开发者论坛上有人报告对数据任务调 `suspend` 挡不住下载。模拟器这一步用不了，所以用同一套网络库在 macOS 上量：

| 量什么 | 结果 |
| --- | --- |
| 一次回调给多少 | 16148 / 49388 / 131072 / 65536 …，在 16 KB 到 128 KB 之间 |
| 攒到 1 MiB 调 `suspend` 之后 | 回调立刻停。之后 4 秒客户端收到的字节数一直是 1048576 |
| 服务端 | 发出 2424832 字节后被挡住（`write()` 返回 false，一直等不到 `drain`）。比客户端多出的约 1.3 MB 在系统和内核的缓冲里 |
| `resume` 之后 | 1 秒里又收了 85 MB，没有报错，不是从头再传 |
| 暂停着直接 `cancel` | 完成回调照常来（-999），服务端看到连接断开 |
| 很小的块（10 字节，间隔 200 ms） | 一块一块立刻到，不攒。响应的类型是 `application/octet-stream` 加 `nosniff`；`application/x-ndjson` 同样 |

所以背压是成立的，那两条说法在这个系统版本上不成立。iOS 这一边由验收用例盯着（读一块之后停下不读，看测试服务是不是被挡住；接着读，核对内容是连着的）：iOS 27.2 模拟器上 Debug 和 Release 都通过。真机没跑。

取消一个被暂停的任务时，代码里先 `resume` 再 `cancel`：实测暂停着直接取消是可以的，但只在 macOS 上量过，先走系统最常走的那条路。

### 断开的四种情况

同一个探针量的。服务端发了两块（各 1000 字节）之后断开：

| 响应 | 怎么断 | 系统给的结果 |
| --- | --- | --- |
| 带 `Content-Length` | 正常关闭（FIN） | 错误 -1005（连接中断） |
| 带 `Content-Length` | 重置（RST） | 错误 -1005 |
| 分块传输 | 重置（RST） | 错误 -1005 |
| 分块传输 | 正常关闭（FIN） | **没有错误**，当作正常结束 |

最后一行是系统的行为，这一层发现不了：`read()` 读到那 2000 字节之后正常结束。Chrome 对同样的情况会报错。验收里把它记成了断言（「这种截断系统不报错」），iOS 27.2 模拟器上和 macOS 一样。

### 响应头要等第一个字节才交上来

`fetch()` 的 Promise 是在 `didReceiveResponse` 里兑现的，一收到就兑现，运行时没有拖。但系统什么时候调 `didReceiveResponse`，和原来以为的不一样：**不是响应头到达的时候，是响应内容的第一个字节到达的时候。**

这是合并验收时量出来的。用例原来断言「服务端发出响应头 700 ms 之后才发内容，`fetch()` 应该早于 500 ms 兑现」，在 iOS 27.2 模拟器上 Debug 和 Release 都失败：日志是「响应头 708 ms，第一块 708 ms」。同一个地址用 `curl` 量，首字节 0.9 ms、总共 702 ms，响应头确实是先发出来的。所以是系统把响应压到了第一块内容到达的时候。它是原来就有的行为，以前没有用例量它。

之后用 macOS 上的原生探针把边界量了一遍（macOS 27，直接用 `NSURLSession`）：

| 服务端怎么发 | `didReceiveResponse` | 第一次 `didReceiveData` |
| --- | --- | --- |
| 发出响应头，700 ms 后才发 10 字节（`application/octet-stream`，分块传输） | 705 ms | 705 ms |
| 同上，带 `Content-Length` | 704 ms | 704 ms |
| 同上，`text/event-stream` / `application/json` / `text/plain`，带不带 `nosniff` | 704–706 ms | 同一时刻 |
| 发出响应头紧接着发 1 字节，700 ms 后再发 1 字节（`application/octet-stream`） | 2 ms | 3 ms |
| 同上，`text/event-stream`、`application/json`、`text/html`（不带 `nosniff`） | 2–6 ms | 同一时刻 |
| 同上，`text/plain` 带 `nosniff` | 6 ms | 6 ms |
| 同上，`text/plain` **不带** `nosniff` | **720 ms** | 720 ms，两个字节合成一块 |
| `text/plain` 不带 `nosniff`，先发 511 字节 | 702 ms | 702 ms，1022 字节合成一块 |
| `text/plain` 不带 `nosniff`，先发 512 字节 | 2 ms | 2 ms |
| 状态码 204，没有内容 | 3 ms | — |

两条规律：

- **响应要等到第一个内容字节才交上来**，和类型、有没有 `Content-Length`、许不许猜类型都没有关系。没有内容的响应在结束时交。
- **`text/plain` 而且没有 `nosniff` 时，系统要攒够 512 字节**（用来猜实际的类型）才往上交任何东西，响应和数据都一样。测试服务的二进制接口一直带着 `nosniff`，原因就是这个。

对 API 的含义写在 [fetch 文档](../guides/streaming-response.md#响应分两步到达)里：持续推送的接口如果连上之后迟迟没有内容，`fetch()` 就一直不返回；服务端发完响应头要紧接着发一小段内容。

运行时这一层绕不过去：系统不调委托，我们就不知道响应头已经到了。把数据任务换成更底层的接口（自己解析 HTTP）能拿到，但那是另一个量级的事，没有做。

验收里这一组只断言确定成立的那一半（`fetch()` 兑现不晚于第一块到达；内容没到时 `read()` 一直等着），各种情况的时刻打在日志里，行首是 `[量]`。

**iOS 模拟器上量到的**（iPhone Air，iOS 27.2，Debug 构建，测试服务在本机；时刻从发请求算起，是 JS 里量的，所以含过桥和回主线程）：

| 服务端怎么发 | 响应的类型 | `fetch()` 兑现 | 各块到达 |
| --- | --- | --- | --- |
| 发出响应头，700 ms 后才发 10 字节 | `application/octet-stream`，带 `nosniff`，分块传输 | 720 ms | 10 字节 @ 720 ms |
| 同上，带 `Content-Length` | 同上 | 704 ms | 10 字节 @ 705 ms |
| 同上 | `text/event-stream`，带 `nosniff` | 707 ms | 10 字节 @ 707 ms |
| 发完响应头紧接着发 1 字节，700 ms 后再发 1 字节 | `application/octet-stream`，带 `nosniff` | 2 ms | 1 字节 @ 2 ms、1 字节 @ 703 ms |
| 同上 | `text/event-stream`，带 `nosniff` | 6 ms | 1 字节 @ 6 ms、1 字节 @ 707 ms |
| 同上 | `text/plain`，带 `nosniff` | 5 ms | 1 字节 @ 5 ms、1 字节 @ 707 ms |
| 同上 | `text/plain`，**不带** `nosniff` | **708 ms** | 2 字节合成一块 @ 708 ms |
| 先发 512 字节，700 ms 后再发 512 字节 | `text/plain`，不带 `nosniff` | 4 ms | 512 字节 @ 4 ms、512 字节 @ 705 ms |

八行和 macOS 的表逐行对得上，两条规律在 iOS 27.2 模拟器上都成立：

- 没有内容字节时，`fetch()` 等到第一块内容才兑现（三行，704–720 ms）；先发 1 个字节，它就在几毫秒里兑现（三行，2–6 ms）。
- `text/plain` 不带 `nosniff` 时，1 个字节不够，要等到后面的内容一起来（708 ms，两个字节合成一块）；先发够 512 字节就立刻兑现（4 ms）。

模拟器上没量的：`application/json` 和 `text/html` 先发 1 字节、`text/plain` 不带 `nosniff` 先发 511 字节（「正好差一个字节不够」那一行）、204。这几行只有 macOS 的数。**真机没有量过。**

### JS 这一侧

每个有内容的 `Request` / `Response` 有一个 body 状态对象（`makeBody`）：内容在哪（本地的 `Blob`，或者网络请求的 id）、`phase`（`readable` / `closed` / `errored`）、`locked`、`disturbed`、在等的 `read()`、现在的读取器。`ReadableStream` 对象只是它的一个面，`response.body` 第一次被取时才建，之后每次给同一个。没人取 `body` 时流对象不存在，但「锁没锁、读没读过」照样记着。

**四种读法走的还是原来的路。** `text()` 等方法先查状态（读过了或者锁着就拒绝），然后把它记成「锁住、读过、整个读走」，接着调的是和以前一样的 `fetchReadBody(id, 'text')`。不经过流，`arrayBuffer()` 的零拷贝没有变。照 Web，这四个方法是「拿一个读取器把流读完」，所以调过之后 `body.locked` 是 `true`——这里直接把标志置上，效果相同。

`bodyUsed` 现在是 `disturbed`：调过 `read()` 或 `cancel()`，或者被四种读法之一读走。只拿了读取器不算。

**本地构造的响应**一块给完：第一次 `read()` 调 `blob.arrayBuffer()`（拷一份，Blob 不可变），给完就关。空的 Blob 直接关，不给空块。

**`releaseLock()` 时有一块在路上**：向原生要的那一块到达时已经没有 `read()` 在等，它进一个队列，下一个读取器先读到它。队列只有这种情况下才会有东西。

**`for await` 的迭代器是手写的对象，不是异步生成器。** 生成器在还没执行过 `next()` 时被 `return()`，函数体一行都不跑，`finally` 里放锁和取消的代码也就不跑，流会一直锁着。手写的对象挂在 `%AsyncIteratorPrototype%` 下面，`next` 和 `return` 排着队执行。

### 生命周期

流读到一半没人要了，请求得停下来。三条路：

| 怎么不要的 | 走哪 |
| --- | --- |
| `cancel()`，或者从 `for await` 里 `break` | JS 当场调 `fetchRelease`：原生停掉任务、删掉记录。同时取消 `FinalizationRegistry` 的登记 |
| `AbortSignal` 中止 | 监听器调 `fetchCancel`，并且在 JS 里当场让流出错（给 `AbortError`） |
| `Response`、流、读取器都没人拿着了 | `Response` 被回收 → `FinalizationRegistry` → `fetchRelease`，和原来没读 body 的 `Response` 是同一条路 |

要这三条成立，引用关系是这样的：读取器 → body 状态 → `Response`（`owner`），流对象 → body 状态。**流活着 `Response` 就活着**，原生那条记录的生死仍然只跟着 `Response` 走。这些都是普通的 JS 对象，没有原生包装，不涉及[所有权镜像](wrapper.md)。

三处细节：

**1. `read()` 等数据期间不用另外拿着 `Response`。** 上面「请求记录的生命周期」里那个洞（读取期间 `Response` 被回收，Promise 永远不结算）在流这里不存在：向原生要下一块时，接结果的回调本身引用着 body 状态，回调挂在那次调用的 Promise 上，Promise 由引擎的待定调用表（`pending_calls`）拿着直到结算。最初照着四种读法的做法把 `Response` 也放进了 `reading` 集合，变异测试时发现去掉它用例照样过，才看清这条链，删了。没有调用在途的流没有这条链，照样被回收。

**2. `fetchRelease` 要把在等的那次调用结算掉。** 原来它只在 `Response` 被回收时来，那时不可能有人在等。现在 `cancel()` 也调它，而 `read()` 可能正等着下一块。记录一删，完成回调就找不到它；不结算的话上一条说的那条链会让 `Response` 永远活着。所以 `fetchRelease` 里以 `AbortError` 拒掉它（JS 那边流已经关了，不看这个结果）。

**3. 中止的监听器只弱引用 body 状态。** 监听器挂在 `signal` 上，而一个 `signal` 可能给很多请求用、活得比每个请求都久。强引用的话，`signal` 不死，它经手的每个 `Response` 和原生那份数据都不放。

中止时在 JS 里当场让流出错，而不是只等原生的回调：内容已经全部到达、只是还没读走时，原生那边请求早就成功结束了，`cancel` 是空操作，只靠它的话这个流会照常读完。Web 的规定是「中止时流还能读就让它出错」。这一条是变异测试补出来的用例。

### 和 Web 标准的差别

| | Web | 这里 | 为什么 |
| --- | --- | --- | --- |
| `fetch()` 什么时候兑现 | 响应头到达时 | 第一个内容字节到达时 | 系统到那时才把响应交上来，见[上面](#响应头要等第一个字节才交上来) |
| `closed` 什么时候兑现 | 内容到头时 | 要 `read()` 到 `done` 才知道 | 流不会自己提前去要下一块。提前要的话总有一次调用在途，丢掉的流就永远不会被回收（见上面第 1 条） |
| 背压从什么时候开始 | 响应一开始 | 第一次 `read()` 之后 | 不改变四种读法已有的行为 |
| 中止时 `read()` 以什么拒绝 | `signal.reason` | `AbortError` | 和 `fetch()` 本身一致，那边早就是这样（没有 `DOMException`，超时也给 `AbortError`） |
| `cancel(reason)` 的 `reason` | 交给流的源头 | 不用 | 源头是网络请求，取消不需要理由 |
| 分块传输的响应被正常关闭截断 | 报错 | 不报错 | 系统的网络库这样处理，见上面 |
| `Request` 的 `body` | 有 | 没有 | 这一步只做响应 |
| `Response.clone()` | 有，流一分为二 | 没有 | 原来就没有；有了它就得做 `tee` |
| 没有内容的网络响应 | `body` 是 `null`，读了不算 `bodyUsed` | 相同 | 这一条**改变了已有的行为**：`HEAD` 和 204、205、304 的响应以前 `text()` 之后 `bodyUsed` 是 `true`、读第二次被拒，现在照标准可以重复读 |
| 构造、`pipeTo` / `pipeThrough` / `tee`、BYOB、排队策略 | 有 | 没有 | 没做 |

### 怎么验的

这一步是在不能用模拟器的条件下做的，模拟器上的验收由合并的一方统一跑。验证分四层：

| | 验了什么 | 没验什么 |
| --- | --- | --- |
| 测试服务（`acceptance/scripts/test-server.mjs`）和它的 Node 用例 | 分块、间隔、断开、不停发、客户端不读时服务端被挡住，都是对的 | — |
| Node 下的临时台架：真的内置脚本（fetch 那个 part）、用 Node 的 http 按原生同样的语义模拟的桥、真的测试服务，跑整个验收步骤 | JS 这一侧的全部逻辑和验收步骤本身。四种变异（要数据期间不拿着 `Response`、`cancel` 不停请求、中止不让流出错、关掉背压）里抓到两种，另外两种一处是多余的代码、一处缺用例，都处理了 | 原生那一半是模拟的 |
| macOS 上的原生探针 | 系统的行为：`suspend` / `resume`、回调的大小、四种断开、响应头什么时候交上来 | iOS 上是不是一样 |
| 合并之后的模拟器验收（iPhone Air，iOS 27.2，Debug 和 Release） | 原生那一段真的跑了：这一步 172 条断言里 171 条通过，包括分块的顺序、取消、中止、服务端中途断开、`for await`、背压、进度；原有的断言没有回归 | 真机 |

没通过的那一条就是上面「响应头要等第一个字节才交上来」：是用例的假设错了，不是实现的问题，用例改成了记实测。改完之后复验，整套验收 Debug 和 Release 各 5079 条通过、0 条失败。

台架和探针没有进仓库。

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

## 网络状态：application.network（2026-11-20）

iOS 的网络状态是 Network 框架的 C 函数（`nw_path_monitor`），不是 ObjC 的类，没有底层可以裸暴露，所以这是我们定的上层 API：`Network` 类（不能 `new`），`application.network` 拿到它，三个只读属性 `isConnected`、`type`（`'wifi' | 'cellular' | 'wired' | 'other' | 'none'`）、`isExpensive`，变了派发 `change`（原生的通知，延后一轮）。形状照 Web 的 `navigator.onLine` 和 `navigator.connection`。

- 监视器在自己的串行队列上跑，第一次报告是异步的。`main.js` 一启动就同步执行，可能赶在第一次报告之前读：那时在后台队列之外等，最多 100 ms 拿到初值。等的不是主线程，不会死锁。
- 运行时的 framework 要链接 `Network.framework`（`project.yml`），ObjC++ 的 `#import` 不触发自动链接，第一次编就撞了。
- `type` 按 Wi-Fi、蜂窝、有线的顺序问 `nw_path_uses_interface_type`，都不是就给 `'other'`。
- 模拟器上读到的是已连接、`wifi`、不按流量计费。断网、换网络时 `change` 来不来没验：模拟器跟着 Mac 的网络，自动跑的验收改不了。
