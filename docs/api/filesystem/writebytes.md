---
type: reference
native: "-[NSData writeToFile:options:error:]"
---

# `FileSystem`：`writeBytes()` 方法

**`writeBytes()`** 方法把 `Blob` 里的字节写进文件，替换整个文件。

## 语法

```
writeBytes(path, blob)
```

### 参数

**`path`**

文件的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

**`blob`**

要写入的内容，[`Blob`](../fetch.md)。手里是 `Uint8Array` 或 `ArrayBuffer` 时，先用 `new Blob([...])` 包一层。[`fetch`](../fetch.md) 取回的内容用 `response.blob()` 读成 `Blob`，可以直接传进来。

### 返回值

Promise，兑现成 `undefined`。Promise 完成时文件已经写好。

文件不存在时创建、已经存在时覆盖、不会自动建目录、写到一半被结束时的情况，和 [`writeText()`](writetext.md#返回值) 相同。

实测在模拟器上写一个 4 MB 的文件，从调用到 Promise 完成 8.0 ms，这段时间不占用界面所在的线程；`new Blob([数据])` 那一步占用 1.2 ms，它把数据复制一份，耗时和数据大小成正比。见[文件大小](../filesystem.md#文件大小)。

### 异常

**`TypeError`**

这时当场抛出，不返回 Promise。

- `path` 不是字符串，或是空字符串：`writeBytes: path must be a non-empty string`。
- `blob` 不是 `Blob`：`writeBytes: the second argument must be a Blob`。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const path = fs.temporary + '/bytes.bin';
  await fs.writeBytes(path, new Blob([new Uint8Array([1, 2, 3])]));
  const info = await fs.stat(path);
  console.log(info.size);
}
demo();
```

**结果**：输出 `3`。

## 对应的 iOS API

`-[NSData writeToFile:options:error:]`，带 `NSDataWritingAtomic`。`NSData` 换成 `Blob`。

## 参见

- [`readBytes()`](readbytes.md)
- [把下载的图片存进缓存目录](../../guides/files.md#把下载的图片存进缓存目录)
