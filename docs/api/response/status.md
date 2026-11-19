---
type: reference
web: Response.status
---

# `Response`：`status` 属性

**`status`** 属性是响应的 HTTP 状态码，比如 `200`、`404`。

## 值

数字。

- 只读。给它赋值抛 `TypeError`。
- `fetch()` 得到的响应上是服务器返回的状态码。服务器返回 301、302 时系统自动跟随重定向，这里是最终那个响应的状态码。
- 自己用 [`new Response()`](constructor.md) 创建时，是 `init.status`，默认 `200`。
- `Response` 创建之后不再变化。

## 示例

```js
const res = new Response('created', { status: 201 });
console.log(res.status, res.ok);
```

**结果**：输出 `201 true`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`ok`](ok.md)：状态码是否在 200 到 299 之间
- [`statusText`](statustext.md)
