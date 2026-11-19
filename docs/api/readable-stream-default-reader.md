---
type: reference
web: ReadableStreamDefaultReader
---

# `ReadableStreamDefaultReader`

**`ReadableStreamDefaultReader`** 表示一个[流](readable-stream.md)的读取器：拿着流的锁，用 [`read()`](readable-stream-default-reader/read.md) 一块一块地读。从 [`stream.getReader()`](readable-stream/getreader.md) 得到。

同一时刻一个流只有一个读取器。读取器调 [`releaseLock()`](readable-stream-default-reader/releaselock.md) 放开锁之后作废，流可以交给新的读取器，从上次读到的地方接着读。

**继承关系**：`ReadableStreamDefaultReader` 不继承其他类。

## 构造函数

[`ReadableStreamDefaultReader()`](readable-stream-default-reader/constructor.md)

给一个流创建读取器，和 `stream.getReader()` 效果相同。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`closed`](readable-stream-default-reader/closed.md) <small>只读</small> | 流结束时完成的 `Promise` |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`read()`](readable-stream-default-reader/read.md) | 读下一块 |
| [`cancel()`](readable-stream-default-reader/cancel.md) | 不要剩下的内容了 |
| [`releaseLock()`](readable-stream-default-reader/releaselock.md) | 放开锁，这个读取器作废 |

## 概念

### 出错时

| 情况 | 结果 |
| --- | --- |
| 请求被 `AbortController` 取消，或 `AbortSignal.timeout()` 到时间 | 正在等待的和之后的 `read()` 都被拒绝，异常是 `name` 为 `'AbortError'` 的 `Error`；`closed` 也以它被拒绝。内容已经全部到达、只是还没读走时也一样 |
| 下载中途网络中断 | `read()` 被拒绝，异常是 `TypeError`，`message` 以 `Network request failed: ` 开头；`closed` 也以它被拒绝。中断之前到达、还没读走的内容不再给 |
| 调过 `releaseLock()` 之后调 `read()`、`cancel()` | 返回的 `Promise` 以 `TypeError` 被拒绝；`closed` 也以 `TypeError` 被拒绝 |
| 有 `read()` 正在等待时调 `releaseLock()` | 那个 `read()` 以 `TypeError` 被拒绝。它要读的那一块不会丢，下一个读取器会读到 |

有一种中断发现不了：响应头里没有 `Content-Length`，服务器发到一半正常关闭了连接。系统把它当作内容发完了，`read()` 读到已经到达的部分之后正常结束，不报错（模拟器上实测）。需要确认内容完整时，让服务器给出 `Content-Length` 并和读到的字节数比对，或者在内容里自带结束标记。

## 示例

```js
async function main() {
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
main();
```

**结果**：3 秒后输出 `30`。**未在模拟器验证。**

## 和 Web 的差别

- 请求被取消时，`read()` 以 `AbortError` 拒绝，不是 `signal.reason`。
- 来自 `fetch()` 的流，`closed` 要 `read()` 到 `done` 才完成。Web 在内容到头时完成。
- 没有 `Content-Length` 的响应被截断时，服务器正常关闭连接就不报错。Web 会报错。
- 没有 `ReadableStreamBYOBReader`。

## 参见

- [`ReadableStream`](readable-stream.md)
- [边下载边读响应](../guides/streaming-response.md)
