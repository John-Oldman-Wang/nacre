---
type: reference
native: "+[NSString stringWithContentsOfFile:encoding:error:]"
---

# `FileSystem`：`readText()` 方法

**`readText()`** 方法按 UTF-8 读出整个文件的文本。

## 语法

```
readText(path)
```

### 参数

**`path`**

文件的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

### 返回值

Promise，兑现成文件的全部文本（字符串）。

- 整个文件一次读进内存，没有分段读。
- 文件内容不是合法的 UTF-8 时的结果**未在模拟器验证**。
- 文件不存在时 Promise 被拒绝，`name` 是 `'NotFoundError'`。其他失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

`path` 不是字符串，或是空字符串：`readText: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  await fs.writeText(fs.temporary + '/hello.txt', '你好 Nacre');
  console.log(await fs.readText(fs.temporary + '/hello.txt'));
}
demo();
```

**结果**：输出 `你好 Nacre`。

## 对应的 iOS API

`+[NSString stringWithContentsOfFile:encoding:error:]`，编码固定是 UTF-8。`NSError` 换成 Promise 被拒绝。

## 参见

- [`readBytes()`](readbytes.md)：读二进制内容
- [`writeText()`](writetext.md)
