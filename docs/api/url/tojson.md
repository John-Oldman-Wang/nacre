---
type: reference
web: URL.toJSON()
---

# `URL`：`toJSON()` 方法

**`toJSON()`** 方法返回完整的地址文本，和 [`href`](href.md) 相同。`JSON.stringify()` 遇到 `URL` 时调用它。

## 语法

```
toJSON()
```

### 参数

无。

### 返回值

字符串，等于 [`href`](href.md)。

### 异常

无。

## 示例

```js
const u = new URL('https://a.com/x');
console.log(JSON.stringify({ link: u }));
```

**结果**：输出 `{"link":"https://a.com/x"}`。地址作为带引号的字符串写进 JSON。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`href`](href.md)
- [`toString()`](tostring.md)
