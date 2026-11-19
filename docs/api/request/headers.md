---
type: reference
web: Request.headers
---

# `Request`：`headers` 属性

**`headers`** 属性是请求头，一个 [`Headers`](../headers.md) 对象。

## 值

[`Headers`](../headers.md)。

- 可读，不可写。
- 构造时没写 `Content-Type`、又给了请求体时，按请求体的种类补一个默认的，规则见 [`fetch()` 的 `init.body`](../fetch/fetch.md#参数)。

## 示例

```js
const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
console.log(req.headers.get('content-type'));
```

**结果**：输出 `text/plain;charset=UTF-8`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`Headers`](../headers.md)
