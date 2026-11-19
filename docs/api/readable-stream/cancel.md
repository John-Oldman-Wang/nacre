---
type: reference
web: ReadableStream.cancel()
---

# `ReadableStream`：`cancel()` 方法

**`cancel()`** 方法表示不要剩下的内容了。来自 `fetch()` 的流会把请求停掉。

## 语法

```
cancel()
cancel(reason)
```

### 参数

**`reason`**

任意值，可选。不起作用。

### 返回值

`Promise`，完成时得到 `undefined`。

- 来自 `fetch()` 的流：请求停止，已经下载、还没读走的内容被丢弃。
- 之后再读，得到的是 `done: true`。
- 调过之后，所在 `Response` 的 [`bodyUsed`](../response/bodyused.md) 是 `true`。

### 异常

返回的 `Promise` 在这些情况下被拒绝：

**`TypeError`**

流已经锁住：`Cannot cancel a ReadableStream that is locked`。这时要取消，用拿着锁的那个读取器的 [`cancel()`](../readable-stream-default-reader/cancel.md)。

**流出错时的那个异常**

流已经因为请求被取消或网络中断而出错。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/bytes/100000');
  console.log(res.status);
  if (res.body !== null) await res.body.cancel();
  console.log(res.bodyUsed);
}
main();
```

**结果**：输出 `200` 和 `true`。剩下的内容不再下载。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`ReadableStreamDefaultReader` 的 `cancel()`](../readable-stream-default-reader/cancel.md)
