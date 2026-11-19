---
type: reference
web: ReadableStreamDefaultReader.releaseLock()
---

# `ReadableStreamDefaultReader`：`releaseLock()` 方法

**`releaseLock()`** 方法放开读取器对流的锁，这个读取器从此作废。

## 语法

```
releaseLock()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。重复调用没有效果。

## 说明

- 之后可以对流再调 `getReader()`，从上次读到的地方接着读。
- 之后对这个读取器调 `read()`、`cancel()`，返回的 `Promise` 以 `TypeError` 被拒绝；`closed` 也以 `TypeError` 被拒绝。
- 有 `read()` 正在等待时调用：那个 `read()` 以 `TypeError` 被拒绝。它要读的那一块不会丢，下一个读取器会读到。
- `res.body` 上有读取器时 `Response` 的四个读取方法被拒绝；调 `releaseLock()` 之后，四个方法可以照常用（前提是还没用 `read()` 读过）。

## 示例

```js
async function main() {
  const res = new Response('abc');
  if (res.body === null) return;
  const reader = res.body.getReader();
  reader.releaseLock();
  console.log(await res.text());
}
main();
```

**结果**：输出 `abc`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`ReadableStream` 的 `locked`](../readable-stream/locked.md)
