---
type: reference
web: URLSearchParams.get()
---

# `URLSearchParams`：`get()` 方法

**`get()`** 方法返回第一个同名参数的值。

## 语法

```
get(name)
```

### 参数

**`name`**

参数名，字符串。不是字符串的值先转成字符串。

### 返回值

字符串，第一个名字是 `name` 的参数的值。没有这个名字返回 `null`。

### 异常

无。

## 示例

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(q.get('a'), q.get('c'));
```

**结果**：输出 `1 null`。`get()` 只返回第一个，要全部用 [`getAll()`](getall.md)。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`getAll()`](getall.md)：同名的全部值
- [`has()`](has.md)：只判断有没有
