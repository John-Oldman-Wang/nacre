---
type: reference
web: Response.type
---

# `Response`：`type` 属性

**`type`** 属性在 Nacre 里永远是 `'basic'`。

## 值

字符串，永远是 `'basic'`。

- 只读。给它赋值抛 `TypeError`。
- `fetch()` 可以请求任何地址，没有跨域规则，所以没有 `'cors'`、`'opaque'` 这些取值。

## 示例

```js
const res = new Response('x');
console.log(res.type);
```

**结果**：输出 `basic`。

## 和 Web 的差别

Web 按请求是否跨域给出 `'basic'`、`'cors'`、`'opaque'` 等取值。Nacre 里永远是 `'basic'`。

## 参见

- [`fetch()`](../fetch/fetch.md)
