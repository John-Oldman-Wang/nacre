---
type: reference
web: Request.arrayBuffer()
---

# `Request`：`arrayBuffer()` 方法

**`arrayBuffer()`** 方法读出构造时给的请求体，得到一个 `ArrayBuffer`。

## 语法

```
arrayBuffer()
```

### 参数

无。

### 返回值

`Promise`，完成时得到 `ArrayBuffer`。没有请求体时得到长度为 0 字节的 `ArrayBuffer`。

### 异常

返回的 `Promise` 在请求体已经读过时被拒绝：

**`TypeError`**

`Body has already been read`。

## 示例

```js
async function main() {
  const req = new Request('https://httpbin.org/post', {
    method: 'POST',
    body: new Uint8Array([1, 2, 3]),
  });
  const buffer = await req.arrayBuffer();
  console.log(buffer.byteLength);
}
main();
```

**结果**：输出 `3`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`Response` 的 `arrayBuffer()`](../response/arraybuffer.md)
