---
type: reference
web: Response.arrayBuffer()
---

# `Response`：`arrayBuffer()` 方法

**`arrayBuffer()`** 方法读出全部响应内容，得到一个 `ArrayBuffer`。

## 语法

```
arrayBuffer()
```

### 参数

无。

### 返回值

`Promise`。内容全部下载完之后完成，得到 `ArrayBuffer`。没有内容的响应得到长度为 0 字节的 `ArrayBuffer`。

### 异常

返回的 `Promise` 在这些情况下被拒绝：

**`TypeError`**

- 内容已经读过：`Body has already been read`。
- [`body`](body.md) 上有读取器：`Body is locked: response.body has a reader`。
- 下载中途网络中断：`message` 以 `Network request failed: ` 开头。

**`name` 是 `'AbortError'` 的 `Error`**

下载中途请求被取消，或者 `AbortSignal.timeout()` 到了时间。

## 说明

要自己逐字节处理二进制数据时用它，不生成字符串。只是拿到之后交给别的 API（生成图片、写进文件）时用 [`blob()`](blob.md)，内容不进入 JS 的内存。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/range/256');
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  console.log(buffer.byteLength, bytes[0]);
}
main();
```

**结果**：输出 `256 97`。`97` 是字母 `a` 的编码。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`blob()`](blob.md)
- [四种读法怎么选](../response.md#四种读法怎么选)
