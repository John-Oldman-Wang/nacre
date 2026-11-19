---
type: reference
web: ReadableStreamDefaultReader.closed
---

# `ReadableStreamDefaultReader`：`closed` 属性

**`closed`** 属性是一个 `Promise`，流结束时完成，出错时被拒绝。

## 值

`Promise`。

- 只读。给它赋值抛 `TypeError`。
- 流结束时完成，得到 `undefined`。
- 读取出错时被拒绝，异常和 [`read()`](read.md) 的相同。
- 调过 [`releaseLock()`](releaselock.md) 之后以 `TypeError` 被拒绝。
- 来自 `fetch()` 的流要 `read()` 到 `done` 才知道结束，所以只等 `closed`、不调 `read()` 是等不到的。

## 示例

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  const reader = res.body.getReader();
  reader.closed.then(() => console.log('结束了'));
  while (!(await reader.read()).done) { /* 读到头 */ }
}
main();
```

**结果**：读到 `done` 之后输出 `结束了`。

## 和 Web 的差别

来自 `fetch()` 的流，`closed` 要 `read()` 到 `done` 才完成。Web 在内容到头时完成。

## 参见

- [`read()`](read.md)
