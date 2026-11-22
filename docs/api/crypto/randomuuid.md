---
type: reference
---

# `Crypto`：`randomUUID()` 方法

**`randomUUID()`** 方法返回一个随机生成的第 4 版 UUID。

## 语法

```
crypto.randomUUID()
```

### 参数

无。

### 返回值

字符串，36 个字符，由 32 个小写的十六进制字符和 4 个连字符组成，形如 `3f2b8c1e-9d47-4a6b-8e15-0c7f2a9d6b31`。其中 122 位是随机的。每次调用都不一样。

### 异常

**`OperationError`**

系统的随机源失败：`the system random source failed`。这是一个 [`DOMException`](../dom-exception.md)，`name` 是 `OperationError`。

## 示例

```js
const id = crypto.randomUUID();
console.log(id, id.length);
```

**结果**：输出一个 UUID 和 `36`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`getRandomValues()`](getrandomvalues.md)
