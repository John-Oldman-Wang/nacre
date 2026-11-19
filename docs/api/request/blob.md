---
type: reference
web: Request.blob()
---

# `Request`：`blob()` 方法

**`blob()`** 方法读出构造时给的请求体，得到一个 [`Blob`](../blob.md)。

## 语法

```
blob()
```

### 参数

无。

### 返回值

`Promise`，完成时得到 [`Blob`](../blob.md)。没有请求体时得到 `size` 为 0 的 `Blob`。

### 异常

返回的 `Promise` 在请求体已经读过时被拒绝：

**`TypeError`**

`Body has already been read`。

## 示例

```js
async function main() {
  const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
  const blob = await req.blob();
  console.log(blob.size);
}
main();
```

**结果**：输出 `5`。**未在模拟器验证。**

## 和 Web 的差别

Web 里得到的 `Blob` 的 `type` 取自请求的 `Content-Type`。Nacre 里：请求体是 `Blob` 时得到的就是那个 `Blob`，`type` 是它自己的；其它请求体得到的 `Blob` 的 `type` 是空串。**来自代码，未在模拟器验证。**

## 参见

- [`Blob`](../blob.md)
- [`Response` 的 `blob()`](../response/blob.md)
