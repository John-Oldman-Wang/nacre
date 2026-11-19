---
type: reference
web: AbortSignal.throwIfAborted()
---

# `AbortSignal`：`throwIfAborted()` 方法

**`throwIfAborted()`** 方法在信号已经取消时抛出 [`reason`](reason.md)，没有取消时什么都不做。

## 语法

```
throwIfAborted()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

信号已经取消时，抛出 [`reason`](reason.md) 本身，它可以是任意值。

## 示例

```js
const controller = new AbortController();
controller.signal.throwIfAborted();
controller.abort('停');
try {
  controller.signal.throwIfAborted();
} catch (err) {
  console.log(err);
}
```

**结果**：第一次调用什么都不做，第二次抛出 `'停'`，输出 `停`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`aborted`](aborted.md)
