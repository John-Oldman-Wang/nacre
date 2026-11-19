---
type: reference
web: URLSearchParams.forEach()
---

# `URLSearchParams`：`forEach()` 方法

**`forEach()`** 方法按列表顺序对每个参数调用一次回调。

## 语法

```
forEach(callback[, thisArg])
```

### 参数

**`callback`**

函数，调用时传三个参数：`callback(value, name, params)`。`value` 是值，`name` 是名字，`params` 是这个 `URLSearchParams`。

**`thisArg`**

可选。调用 `callback` 时的 `this`。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

注意回调的参数顺序是值在前、名字在后。列表在遍历期间被修改时，遍历的仍是开始时的那一份。**未在模拟器验证。**

## 示例

```js
const q = new URLSearchParams('a=1&b=2');
q.forEach((value, name) => {
  console.log(name, value);
});
```

**结果**：输出 `a 1` 和 `b 2`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`entries()`](entries.md)
