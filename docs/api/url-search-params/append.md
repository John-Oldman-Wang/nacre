---
type: reference
web: URLSearchParams.append()
---

# `URLSearchParams`：`append()` 方法

**`append()`** 方法在列表末尾加一个参数，不管有没有同名的。

## 语法

```
append(name, value)
```

### 参数

**`name`**

参数名，字符串。不是字符串的值先转成字符串。

**`value`**

参数值，字符串。不是字符串的值先转成字符串。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

这个列表是某个 `URL` 的 [`searchParams`](../url/searchparams.md) 时，地址的 `search` 和 `href` 跟着变。

## 示例

```js
const q = new URLSearchParams('a=1');
q.append('a', '2');
q.append('c', '中 文');
console.log(q.toString());
```

**结果**：输出 `a=1&a=2&c=%E4%B8%AD+%E6%96%87`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`set()`](set.md)：替换而不是追加
