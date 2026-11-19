---
type: reference
web: Request.url
---

# `Request`：`url` 属性

**`url`** 属性是请求的地址，规范化之后的完整 URL。

## 值

字符串。

- 可读，不可写。
- 构造时给的地址经过 [`URL`](../url.md) 规范化，比如主机名转成小写、只有主机名的地址补上 `/`。

## 示例

```js
const req = new Request('https://HTTPBIN.org');
console.log(req.url);
```

**结果**：输出 `https://httpbin.org/`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`URL`](../url.md)：地址怎么规范化
