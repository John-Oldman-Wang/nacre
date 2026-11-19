---
type: reference
web: Blob.type
---

# `Blob`：`type` 属性

**`type`** 属性是 `Blob` 内容的类型，比如 `'image/png'`。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new Blob()`](constructor.md) 创建时是 `options.type`，默认空串。
- [`res.blob()`](../response/blob.md) 得到的 `Blob` 上是空串，不取响应头里的 `Content-Type`。
- 把 `Blob` 当 [`fetch()`](../fetch/fetch.md) 的请求体时，`type` 不是空串、又没写 `Content-Type`，它会成为请求的 `Content-Type`。

## 示例

```js
async function main() {
  const bytes = new Uint8Array([0, 255, 16, 128]);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const res = await fetch('https://httpbin.org/post', { method: 'POST', body: blob });
  const echo = await res.json();
  console.log(echo.headers['Content-Type']);
}
main();
```

**结果**：输出 `application/octet-stream`。

## 和 Web 的差别

`res.blob()` 得到的 `Blob` 上是空串。Web 里取自 `Content-Type`。

## 参见

- [`size`](size.md)
