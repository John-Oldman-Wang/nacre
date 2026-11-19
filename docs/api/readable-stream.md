---
type: reference
web: ReadableStream
---

# `ReadableStream`

**`ReadableStream`** 表示一份可以一块一块读出来的数据。现在它只有一个来源：[`Response`](response.md) 的 [`body`](response/body.md) 属性。每一块是一个 `Uint8Array`。

读一个流有两种写法：`for await (const chunk of stream)`，或者 [`getReader()`](readable-stream/getreader.md) 拿一个[读取器](readable-stream-default-reader.md)再反复调 `read()`。两种写法在读的时候都会把流**锁住**：同一时刻只有一方能读，锁住期间再拿读取器会抛异常。

**继承关系**：`ReadableStream` 不继承其他类。

怎么边下载边读响应、显示下载进度，见指南[边下载边读响应](../guides/streaming-response.md)。

## 构造函数

不能用 `new` 创建：`new ReadableStream()` 抛 `TypeError`，信息以 `ReadableStream cannot be constructed yet` 开头。从 [`res.body`](response/body.md) 得到。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`locked`](readable-stream/locked.md) <small>只读</small> | 流是否被锁住 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`getReader()`](readable-stream/getreader.md) | 拿一个读取器，并把流锁住 |
| [`values()`](readable-stream/values.md) | 返回 `for await` 用的异步迭代器 |
| [`[Symbol.asyncIterator]()`](readable-stream/symbol.asynciterator.md) | 和 `values()` 是同一个函数。所以流可以直接放进 `for await` |
| [`cancel()`](readable-stream/cancel.md) | 不要剩下的内容了，停掉请求 |

## 概念

### `for await` 的行为

- 循环期间流是锁住的。循环正常结束、提前 `break`、循环体抛出异常，三种情况下锁都会放开。
- 提前 `break` 或 `return` 时流被取消，请求停止。想保留流、之后接着读，用 [`values({ preventCancel: true })`](readable-stream/values.md)。
- 读取出错（请求被取消、网络中断）时，异常从 `for await` 那一行抛出。

### 一块有多大

一块有多大、一共分几块，由网络和读取的快慢决定，和服务器每次发送多少没有固定关系：服务器分两次发的内容可能合成一块到达，一次发的内容也可能分成几块。代码不能假设一块就是一条完整的消息。

每一块 `Uint8Array` 是独立的一份数据，可以改写，也可以留着以后用。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/drip?duration=3&numbytes=30&delay=0');
  if (res.body === null) throw new Error('这个响应没有内容');

  let received = 0;
  for await (const chunk of res.body) {
    received += chunk.byteLength;
    console.log('收到', chunk.byteLength, '字节，累计', received);
  }
  console.log('读完了');
}
main();
```

**结果**：这个测试地址在 3 秒里陆续发出 30 个字节。3 秒内陆续输出若干行「收到……」，最后一行的累计是 `30`，然后输出 `读完了`。**未在模拟器验证。**

## 和 Web 的差别

- 不能用 `new` 创建，只能从 `res.body` 得到。
- 没有 `pipeTo()`、`pipeThrough()`、`tee()`，没有静态方法 `ReadableStream.from()`。
- `getReader({ mode: 'byob' })` 抛 `TypeError`，不支持这种读取器。

## 参见

- [`ReadableStreamDefaultReader`](readable-stream-default-reader.md)：读取器
- [`Response` 的 `body`](response/body.md)：流从这里来
- [边下载边读响应](../guides/streaming-response.md)
