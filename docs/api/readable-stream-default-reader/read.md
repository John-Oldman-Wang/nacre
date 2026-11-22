---
type: reference
web: ReadableStreamDefaultReader.read()
---

# `ReadableStreamDefaultReader`：`read()` 方法

**`read()`** 方法读流里的下一块。

## 语法

```
read()
```

### 参数

无。

### 返回值

`Promise`：

- 有数据时得到 `{ done: false, value }`，`value` 是 `Uint8Array`。
- 内容全部读完之后得到 `{ done: true, value: undefined }`。
- 还没有数据时一直等到有。
- 攒了多少，一次就给多少：读得慢时取走的一块可能比较大。

`read()` 可以不等上一次完成就再调，结果按调用的先后给。

### 异常

返回的 `Promise` 在这些情况下被拒绝：

**[`DOMException`](../dom-exception.md)，`name` 是 `'AbortError'`**

请求被 `AbortController` 取消，或 `AbortSignal.timeout()` 到时间。正在等待的和之后的 `read()` 都被拒绝。内容已经全部到达、只是还没读走时也一样。

**`TypeError`**

- 下载中途网络中断：`message` 以 `Network request failed: ` 开头。中断之前到达、还没读走的内容不再给。
- 调过 [`releaseLock()`](releaselock.md) 之后调用：`This reader has been released`。
- 等待期间读取器调了 `releaseLock()`。它要读的那一块不会丢，下一个读取器会读到。

## 说明

第一次调 `read()` 之后，读得比下载慢时请求会暂停，见[读得慢时请求会暂停](../../guides/streaming-response.md#读得慢时请求会暂停)。

## 示例

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  const reader = res.body.getReader();
  const first = await reader.read();
  const second = await reader.read();
  console.log(first.value, second.done);
}
main();
```

**结果**：输出一个内容是 `97, 98, 99` 的 `Uint8Array` 和 `true`。

## 和 Web 的差别

请求被取消时以 `AbortError` 拒绝。Web 里以 `signal.reason` 拒绝。

## 参见

- [`ReadableStreamDefaultReader`](../readable-stream-default-reader.md#出错时)
