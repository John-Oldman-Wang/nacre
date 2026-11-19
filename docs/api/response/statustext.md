---
type: reference
web: Response.statusText
---

# `Response`：`statusText` 属性

**`statusText`** 属性是状态码对应的文字。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- `fetch()` 得到的响应上永远是空串 `''`。
- 自己用 [`new Response()`](constructor.md) 创建时，是 `init.statusText`，默认 `''`。
- `Response` 创建之后不再变化。

## 示例

```js
const res = new Response(null, { status: 404, statusText: 'Not Found' });
console.log(res.statusText);
```

**结果**：输出 `Not Found`。

## 和 Web 的差别

`fetch()` 得到的响应上永远是空串。Web 里是服务器返回的那段文字。

## 参见

- [`status`](status.md)
