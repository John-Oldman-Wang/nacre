---
type: reference
web: URLSearchParams.values()
---

# `URLSearchParams`：`values()` 方法

**`values()`** 方法返回一个迭代器，按列表顺序给出每个参数的值。

## 语法

```
values()
```

### 参数

无。

### 返回值

迭代器，每一项是一个字符串。

### 异常

无。

## 说明

列表在遍历期间被修改时，遍历的仍是开始时的那一份。**未在模拟器验证。**

## 示例

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(Array.from(q.values()));
```

**结果**：输出 `['1', '2', '3']`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`keys()`](keys.md)
- [`entries()`](entries.md)
