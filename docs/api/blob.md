---
type: reference
web: Blob
---

# `Blob`

**`Blob`** 表示一块不可修改的二进制数据。它的内容不放在 JS 的内存里，JS 这边只有 [`size`](blob/size.md) 和 [`type`](blob/type.md)。需要读内容时调用它的方法。

`Blob` 有两个来源：[`res.blob()`](response/blob.md) 得到下载的内容，[`new Blob(parts)`](blob/constructor.md) 用手头的字符串或字节创建。

`Blob` 可以交给这些 API：[`fetch()`](fetch.md) 当请求体发送，[`UIImage.imageWithData()`](ui-image.md) 生成图片，[`application.fileSystem`](filesystem.md) 的 `writeBytes()` 写进文件，[`application.keychain`](keychain.md) 的 `setBytes()` 存进钥匙串（要先装 `@nacrejs/keychain`）。

**继承关系**：`Blob` 不继承其他类。

## 构造函数

[`Blob()`](blob/constructor.md)

把字符串和字节拼成一个 `Blob`。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`size`](blob/size.md) <small>只读</small> | 字节数 |
| [`type`](blob/type.md) <small>只读</small> | 内容的类型，比如 `'image/png'` |

## 实例方法

两个方法可以调用任意多次，没有「只能读一次」的限制。

| 方法 | 说明 |
| --- | --- |
| [`arrayBuffer()`](blob/arraybuffer.md) | 得到内容的一份 `ArrayBuffer` 拷贝 |
| [`text()`](blob/text.md) | 按 UTF-8 解码成字符串 |

## 示例

```js
async function main() {
  const blob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
  console.log(blob.size, blob.type);
  console.log(await blob.text());
}
main();
```

**结果**：输出 `13 text/plain` 和 `前缀-后缀`。`size` 是 UTF-8 编码后的字节数，一个汉字占 3 个字节。

## 和 Web 的差别

- `parts` 的元素不能是 `Blob`，`new Blob([blob])` 抛 `TypeError`。
- 没有 `slice()`、`stream()`、`bytes()`。没有 `File`。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用几个 `Blob` 拼成一个新的 `Blob` | 未实现 |
| 取 `Blob` 的一段（`slice()`） | 未实现 |

## 参见

- [`Response` 的 `blob()`](response/blob.md)：把下载的内容读成 `Blob`
- [`UIImage`](ui-image.md)：把 `Blob` 变成图片
- [文件读写](filesystem.md)：把 `Blob` 写进文件
