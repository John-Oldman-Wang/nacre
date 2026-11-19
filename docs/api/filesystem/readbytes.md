---
type: reference
native: "+[NSData dataWithContentsOfFile:options:error:]"
---

# `FileSystem`：`readBytes()` 方法

**`readBytes()`** 方法读出整个文件的字节。

## 语法

```
readBytes(path)
```

### 参数

**`path`**

文件的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

### 返回值

Promise，兑现成 `ArrayBuffer`。

- 整个文件一次读进内存，没有分段读。
- 文件不存在时 Promise 被拒绝，`name` 是 `'NotFoundError'`。其他失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

`path` 不是字符串，或是空字符串：`readBytes: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const binPath = fs.temporary + '/bytes.bin';
  await fs.writeBytes(binPath, new Blob([new Uint8Array([0, 1, 2, 253, 254, 255])]));

  const bytes = new Uint8Array(await fs.readBytes(binPath));
  console.log(bytes.length, bytes.join(','));
}
demo();
```

**结果**：输出 `6 0,1,2,253,254,255`。

## 对应的 iOS API

`+[NSData dataWithContentsOfFile:options:error:]`。`NSData` 换成 `ArrayBuffer`，`NSError` 换成 Promise 被拒绝。

## 参见

- [`writeBytes()`](writebytes.md)
- [`readText()`](readtext.md)：读文本
