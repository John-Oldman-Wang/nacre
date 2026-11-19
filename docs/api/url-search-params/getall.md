---
type: reference
web: URLSearchParams.getAll()
---

# `URLSearchParams`：`getAll()` 方法

**`getAll()`** 方法返回全部同名参数的值。

## 语法

```
getAll(name)
```

### 参数

**`name`**

参数名，字符串。不是字符串的值先转成字符串。

### 返回值

字符串数组，按列表顺序。没有这个名字返回空数组。

### 异常

无。

## 示例

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(q.getAll('a'));
```

**结果**：输出 `['1', '3']`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`get()`](get.md)：只要第一个
