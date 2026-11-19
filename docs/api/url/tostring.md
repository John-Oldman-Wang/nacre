---
type: reference
web: URL.toString()
---

# `URL`：`toString()` 方法

**`toString()`** 方法返回完整的地址文本，和 [`href`](href.md) 相同。

## 语法

```
toString()
```

### 参数

无。

### 返回值

字符串，等于 [`href`](href.md)。

### 异常

无。

## 示例

```js
const u = new URL('https://a.com/x?y=1');
console.log(u.toString() === u.href, `${u}`);
```

**结果**：输出 `true https://a.com/x?y=1`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`href`](href.md)
- [`toJSON()`](tojson.md)
