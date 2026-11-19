---
type: reference
native: "-[NSFileManager copyItemAtPath:toPath:error:]"
---

# `FileSystem`：`copy()` 方法

**`copy()`** 方法把一个文件或目录复制到另一个位置。

## 语法

```
copy(from, to)
```

### 参数

**`from`**

源文件或目录的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

**`to`**

完整的目标路径，包含文件名，非空字符串。不是目标所在的目录。

### 返回值

Promise，兑现成 `undefined`。完成后原位置的文件还在。

- 目标位置已经有文件时的结果**未在模拟器验证**。
- 失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

`from` 或 `to` 不是字符串，或是空字符串：`copy: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const src = fs.documents + '/src.txt';
  await fs.writeText(src, '内容');
  await fs.copy(src, fs.documents + '/copy.txt');
  console.log(await fs.exists(src), await fs.readText(fs.documents + '/copy.txt'));
}
demo();
```

**结果**：输出 `true 内容`。

## 对应的 iOS API

`-[NSFileManager copyItemAtPath:toPath:error:]`。

## 参见

- [`move()`](move.md)：不保留原文件
