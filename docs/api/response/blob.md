---
type: reference
web: Response.blob()
---

# `Response`：`blob()` 方法

**`blob()`** 方法读出全部响应内容，得到一个 [`Blob`](../blob.md)。内容不进入 JS 的内存。

## 语法

```
blob()
```

### 参数

无。

### 返回值

`Promise`。内容全部下载完之后完成，得到 [`Blob`](../blob.md)。

- `Blob` 的 [`type`](../blob/type.md) 是空串，不取响应头里的 `Content-Type`。
- 没有内容的响应得到 `size` 为 0 的 `Blob`。

### 异常

返回的 `Promise` 在这些情况下被拒绝：

**`TypeError`**

- 内容已经读过：`Body has already been read`。
- [`body`](body.md) 上有读取器：`Body is locked: response.body has a reader`。
- 下载中途网络中断：`message` 以 `Network request failed: ` 开头。

**`name` 是 `'AbortError'` 的 `Error`**

下载中途请求被取消，或者 `AbortSignal.timeout()` 到了时间。

## 说明

文件和图片用它读。拿到的 `Blob` 直接交给 [`UIImage.imageWithData()`](../ui-image.md) 或 [`application.fileSystem`](../filesystem.md) 的 `writeBytes()`。内容从下载到交出去都不进入 JS 的内存；下载期间整个内容仍然在 App 的内存里。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/image/png');
  const blob = await res.blob();
  const image = UIImage.imageWithData(blob);
  console.log(blob.size, image !== null);
}
main();
```

**结果**：输出图片的字节数和 `true`。内容不是图片时 `image` 是 `null`。

## 和 Web 的差别

Web 里得到的 `Blob` 的 `type` 取自 `Content-Type`。Nacre 里是空串。

## 参见

- [`Blob`](../blob.md)
- [`arrayBuffer()`](arraybuffer.md)
- [四种读法怎么选](../response.md#四种读法怎么选)
