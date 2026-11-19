---
type: reference
web: AbortSignal.abort()
---

# `AbortSignal.abort()` 静态方法

**`AbortSignal.abort()`** 静态方法返回一个已经处于取消状态的 `AbortSignal`。

## 语法

```
AbortSignal.abort()
AbortSignal.abort(reason)
```

### 参数

**`reason`**

取消的原因，任意值，可选。不给时是一个 `name` 为 `'AbortError'`、`message` 为 `The operation was aborted` 的 `Error`。

### 返回值

新的 `AbortSignal`，[`aborted`](aborted.md) 是 `true`，[`reason`](reason.md) 是给的原因。

### 异常

无。

## 说明

把它交给 `fetch()`，请求立即被取消，`Promise` 以 `reason` 被拒绝。

## 示例

```js
async function main() {
  try {
    await fetch('https://httpbin.org/get', { signal: AbortSignal.abort('不发了') });
  } catch (err) {
    console.log(err);
  }
}
main();
```

**结果**：输出 `不发了`。

## 和 Web 的差别

不给 `reason` 时是 `name` 为 `'AbortError'` 的 `Error`。Web 里是 `DOMException`。

## 参见

- [`AbortSignal.timeout()`](timeout.md)
