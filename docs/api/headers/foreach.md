---
type: reference
web: Headers.forEach()
---

# `Headers`：`forEach()` 方法

**`forEach()`** 方法对每个头调用一次回调。

## 语法

```
forEach(callback[, thisArg])
```

### 参数

**`callback`**

函数，调用时传三个参数：`callback(value, name, headers)`。`value` 是值，`name` 是小写的名字，`headers` 是这个 `Headers`。

**`thisArg`**

可选。调用 `callback` 时的 `this`。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

顺序和 [`entries()`](entries.md) 相同。回调的参数顺序是值在前、名字在后。

## 示例

```js
const h = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
h.forEach((value, name) => {
  console.log(name, value);
});
```

**结果**：输出 `accept a` 和 `content-type application/json`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`entries()`](entries.md)
