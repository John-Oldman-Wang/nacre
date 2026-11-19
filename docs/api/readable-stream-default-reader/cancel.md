---
type: reference
web: ReadableStreamDefaultReader.cancel()
---

# `ReadableStreamDefaultReader`：`cancel()` 方法

**`cancel()`** 方法表示不要剩下的内容了。效果和流的 [`cancel()`](../readable-stream/cancel.md) 相同，在读取器拿着锁的时候用。

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
- 正在等待的 `read()` 以 `{ done: true }` 完成，不是被拒绝。之后再读，得到的也是 `done: true`。

### 异常

返回的 `Promise` 在这些情况下被拒绝：

**`TypeError`**

调过 [`releaseLock()`](releaselock.md) 之后调用：`This reader has been released`。

**流出错时的那个异常**

流已经因为请求被取消或网络中断而出错。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/bytes/100000');
  if (res.body === null) return;
  const reader = res.body.getReader();
  const first = await reader.read();
  await reader.cancel();
  const next = await reader.read();
  console.log(first.done, next.done);
}
main();
```

**结果**：输出 `false true`。读到第一块之后不再下载。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`releaseLock()`](releaselock.md)
