---
type: reference
web: Response.headers
---

# `Response`：`headers` 属性

**`headers`** 属性是响应头，一个 [`Headers`](../headers.md) 对象。

## 值

[`Headers`](../headers.md)。

- 只读。给它赋值抛 `TypeError`。
- 响应头的名字不区分大小写：`get('content-type')` 和 `get('CONTENT-TYPE')` 得到同一个值。
- 服务器返回了多个同名的响应头时，`get()` 得到用 `, ` 连接起来的一个字符串。多条 `Set-Cookie` 用 `getSetCookie()` 分别读。
- 自己用 [`new Response()`](constructor.md) 创建时，是 `init.headers`，没写 `Content-Type` 时按内容补一个默认的。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  console.log(res.headers.get('content-type'));
  console.log(res.headers.get('CONTENT-TYPE'));
}
main();
```

**结果**：两行都输出 `application/json`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`Headers`](../headers.md)：读、遍历响应头的方法
