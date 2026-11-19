# 边下载边读响应

这一篇讲怎么用 [`Response`](../api/response.md) 的 [`body`](../api/response/body.md) 在内容还没下载完时一块一块地读：处理大文件、显示下载进度、读服务器持续推送的文本。涉及的类是 [`ReadableStream`](../api/readable-stream.md) 和 [`ReadableStreamDefaultReader`](../api/readable-stream-default-reader.md)。发请求的基本写法见[从网络取数据](fetch.md)。

下面的例子都写在 `async` 函数里。

## 推荐的做法

- **普通的接口用 `json()`、`text()` 这些方法整个读。** 写法最简单。
- **这三种情况用 `res.body` 边下边读**：内容很大，不想全部留在内存里；要显示下载进度；服务器一直不结束响应。
- **用 `for await` 读。** 循环结束、`break`、抛异常时锁都会自动放开；`break` 时请求自动停止。需要在几处分别读同一个流时，才自己用 `getReader()`。
- **不再需要剩下的内容时，`break` 或者调 `cancel()`。** 读到一半就不再使用的流在被回收时请求也会停止，但回收的时间不确定，不要依赖它。

`body` 和整个读的四个方法只能选一种，规则见[响应内容只能读一次](../api/response.md#响应内容只能读一次)。

## 边下载边处理

`res.body` 是响应内容的流。用 `for await` 遍历它，内容每到一块，循环体执行一次。

```js
async function drip() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('这个响应没有内容');

  let received = 0;
  for await (const chunk of res.body) {
    received += chunk.byteLength;
    console.log('收到', chunk.byteLength, '字节，累计', received);
  }
  console.log('读完了');
}
```

**结果**：这个测试地址在 3 秒里陆续发出 30 个字节。3 秒内陆续输出若干行「收到……」，最后一行的累计是 `30`，然后输出 `读完了`。**未在模拟器验证。**

- 每一块 `chunk` 是一个 `Uint8Array`。它是独立的一份数据，可以改写，也可以留着以后用。
- 一块有多大、一共分几块，由网络和读取的快慢决定，和服务器每次发送多少没有固定关系。代码不能假设一块就是一条完整的消息。
- 循环体里可以用 `await`。处理得慢时，没读走的内容会先攒着，攒多了请求会暂停，见[读得慢时请求会暂停](#读得慢时请求会暂停)。
- 从循环里 `break` 或 `return`，这个请求立即被取消，不再下载。
- 没有内容的响应 `res.body` 是 `null`，所以要先判断。

不用 `for await` 时，自己拿一个读取器来读，效果相同：

```js
async function dripWithReader() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('这个响应没有内容');

  const reader = res.body.getReader();
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
  }
  console.log(received);
}
```

**结果**：3 秒后输出 `30`。**未在模拟器验证。** `read()` 在下一块到达时完成；内容全部读完之后，`done` 是 `true`，`value` 是 `undefined`。

## 显示下载进度

没有专门的进度接口。服务器在 `Content-Length` 响应头里给出了总字节数时，用已经读到的字节数除以它。

```js
async function progress() {
  const res = await fetch('https://httpbin.org/bytes/100000');
  if (!res.ok || res.body === null) throw new Error('下载失败');

  // 没有这个响应头时 Number(null) 是 0
  const total = Number(res.headers.get('content-length'));
  /** @type {Uint8Array[]} */
  const parts = [];
  let received = 0;
  for await (const chunk of res.body) {
    parts.push(chunk);
    received += chunk.byteLength;
    if (total > 0) console.log(Math.round((received / total) * 100) + '%');
  }
  const blob = new Blob(parts);
  console.log(blob.size);
}
```

**结果**：下载过程中输出若干行递增的百分比，最后一行是 `100%`，然后输出 `100000`。**未在模拟器验证。**

- 不是每个响应都有 `Content-Length`。服务器边生成边发送的响应没有这个响应头，这时算不出百分比，只能显示已经下载的字节数。
- 服务器对内容做了压缩（gzip）时，`Content-Length` 和读到的字节数是否还对得上，**未在模拟器验证**。
- 例子把每一块存进数组，最后拼成一个 `Blob`，所以整个文件仍然在内存里。要省内存，就在循环里把每一块处理掉，不要留着。
- 更新界面的次数不用和块数一样多。块来得很密时，隔一段时间更新一次就够了。

## 读服务器持续推送的文本

有的接口不一次返回全部内容，而是保持连接，有新内容就发一行。这种响应没有结束的时候，只能边下边读。下面的代码把到达的内容按换行切成一行一行。

```js
async function lines() {
  const controller = new AbortController();
  const res = await fetch('https://httpbin.org/stream/5', { signal: controller.signal });
  if (res.body === null) throw new Error('这个响应没有内容');

  const decoder = new TextDecoder();
  let rest = '';
  for await (const chunk of res.body) {
    // stream: true：一个汉字的几个字节被切在两块里时，留到下一块再解码
    rest += decoder.decode(chunk, { stream: true });
    const parts = rest.split('\n');
    // 最后一段还没等到换行，留到下一块
    rest = parts.pop() ?? '';
    for (const line of parts) {
      if (line !== '') console.log(JSON.parse(line).id);
    }
  }
}
```

**结果**：这个测试地址发 5 行 JSON 然后结束。依次输出 `0`、`1`、`2`、`3`、`4`。**未在模拟器验证。**

- 一块的结尾不一定是一行的结尾，也不一定是一个字符的结尾。所以没凑齐的半行留在 `rest` 里，没凑齐的半个字符由 [`TextDecoder`](../api/text-decoder.md) 留着。只处理英文和数字时，可以不用它，按字节找换行（`10`）再用 `String.fromCharCode()` 转成字符串。
- 服务器一直不结束响应时，循环不会自己结束。要停下来，调 `controller.abort()`（循环以 `AbortError` 抛出），或者在循环里 `break`。
- **`await fetch()` 要等到第一块内容到达才返回**，不是响应头到达的时候。服务器建立连接之后迟迟没有内容可发时，`fetch()` 就一直不返回。让服务器在响应头之后马上发一点内容（比如一个空行），`fetch()` 就立刻返回；例子里的 `if (line !== '')` 正好跳过它。见[响应分两步到达](#响应分两步到达)。
- 运行时不解析 `text/event-stream` 这种格式，没有 `EventSource`。它的每条消息也是用换行分隔的文本，可以照上面的办法自己切。
- 响应的类型是 `text/plain` 并且没有带 `X-Content-Type-Options: nosniff` 时，系统先攒够 512 个字节才交上来，开头的几条短消息会晚到。见下一节的表。

## 响应分两步到达

`await fetch()` 在状态码、响应头和**第一块响应内容**到达时返回，这时其余的内容可能还在下载。四个读取方法返回的 `Promise` 要等内容全部下载完才完成。

```js
async function twoSteps() {
  const res = await fetch('https://httpbin.org/get');   // 响应头和第一块内容到了
  console.log(res.status);                               // 立刻可用
  const data = await res.json();                         // 这里等内容下载完
  console.log(data.url);
}
```

**结果**：输出 `200`，内容下载完之后输出 `https://httpbin.org/get`。

所以可以先看状态码和响应头，再决定要不要读内容。决定不读时用 `AbortController` 取消请求。

`fetch()` 不是在响应头到达时返回的。iOS 的网络库收到响应头之后先留着，等到响应内容的第一个字节到达，才把响应头和这个字节一起交上来。实测：测试服务发出响应头之后等 700 毫秒才发内容，`fetch()` 在 704 到 720 毫秒之间返回，和第一块内容到达是同一时刻。这一节的数都是在 iOS 27.2 的模拟器上量的，**真机未验证**。

对大多数请求这没有区别：服务器发完响应头紧接着就发内容。有区别的是服务器先发响应头、过一阵才有内容的接口，比如保持连接、有消息才推送的接口：

- 第一条消息来之前，`fetch()` 一直不返回，代码拿不到状态码，分不清是「已经连上、在等消息」还是「还没连上」。
- 用 `AbortSignal.timeout()` 给连接设的超时，会把等第一条消息的时间也算进去。

**让 `fetch()` 立刻返回的办法在服务器这一侧：发完响应头，马上发一点内容，哪怕只有一个字节，之后再等消息。** 这一点内容到达时 `fetch()` 就返回。实测先发 1 个字节，`fetch()` 在 2 到 6 毫秒返回。发的内容会作为流的第一块被读到，所以要选一种读的那一边可以跳过的内容：按行切的文本发一个空行，`text/event-stream` 发一行以冒号开头的注释。

有一种响应 1 个字节不够：类型是 `text/plain`，并且没有带响应头 `X-Content-Type-Options: nosniff`。这时系统要用开头的内容判断它实际是什么类型，攒够 512 个字节之前什么都不往上交，`fetch()` 不返回，已经到达的内容也读不到。`nosniff` 这个响应头告诉系统不要判断。

| 响应的 `Content-Type` | 先发多少内容，`fetch()` 才返回 | 实测 |
| --- | --- | --- |
| `text/event-stream`、`application/octet-stream`（带 `nosniff`） | 1 个字节 | 先发 1 个字节，6 毫秒、2 毫秒返回 |
| `text/plain`，带 `X-Content-Type-Options: nosniff` | 1 个字节 | 先发 1 个字节，5 毫秒返回 |
| `text/plain`，不带 `nosniff` | 512 个字节 | 先发 1 个字节：708 毫秒才返回，和 700 毫秒后发的第二个字节合成一块到达。先发 512 个字节：4 毫秒返回 |

所以推送文本的接口，响应的类型用 `text/event-stream` 这一类，或者带上 `nosniff`，然后在响应头之后马上发一点内容。

`application/json` 和 `text/html` 的响应（不带 `nosniff`）先发 1 个字节就够，这一条是在 macOS 上用原生代码量的，**未在模拟器验证**。

没有内容的响应（`HEAD` 请求的响应、状态码 204）在响应结束时返回，不受影响。

## 读得慢时请求会暂停

用 `res.body` 读的时候，下载和读取是两件事：内容先到达运行时，你的代码调 `read()` 时才交给 JS。代码读得比下载慢，没读走的内容就在内存里攒着。

攒到约 1 MB 时，运行时暂停这个请求，不再从网络接收；下一次 `read()` 把攒着的内容取走之后，请求自动继续。所以不管文件多大、读得多慢，没读走的内容占用的内存都在这个量级，不会一直涨。暂停和继续不需要代码做任何事，也没有事件。

- 暂停期间服务器发不出数据，连接保持着。模拟器上实测：读一块之后停下不读，测试服务再发出一截就发不动了；接着读，内容从停下的地方接着来，不是从头再传。在 macOS 上用原生代码量过具体的数：攒到 1 MB 暂停之后数据立刻不再到达，服务器多发出约 1.4 MB 之后停住。
- 暂停期间系统不计算超时（iOS 文档的说法，**未在模拟器验证**）。服务器自己可能会因为长时间发不出数据而断开连接，那时 `read()` 被拒绝。
- 取走的一块可能比较大。攒了多少，下一次 `read()` 就一次给多少。
- 只有开始用 `read()` 读之后才会暂停。拿到 `Response` 之后一直不读，或者用四个读取方法整个读，都不会暂停，内容全部留在内存里。

## 确认内容完整

有一种中断发现不了：响应头里没有 `Content-Length`，服务器发到一半正常关闭了连接。系统把它当作内容发完了，`read()` 读到已经到达的部分之后正常结束，不报错（模拟器上实测）。需要确认内容完整时，让服务器给出 `Content-Length` 并和读到的字节数比对，或者在内容里自带结束标记。

## 参见

- [`ReadableStream`](../api/readable-stream.md)、[`ReadableStreamDefaultReader`](../api/readable-stream-default-reader.md)
- [`Response` 的 `body`](../api/response/body.md)
- [从网络取数据](fetch.md)
- [WebSocket](../api/websocket.md)：需要双向、持续的连接时用它
