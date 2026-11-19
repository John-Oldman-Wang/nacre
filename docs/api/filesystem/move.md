---
type: reference
native: "-[NSFileManager moveItemAtPath:toPath:error:]"
---

# `FileSystem`：`move()` 方法

**`move()`** 方法把一个文件或目录移到另一个位置，或者改名。

## 语法

```
move(from, to)
```

### 参数

**`from`**

源文件或目录的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

**`to`**

完整的目标路径，包含文件名，非空字符串。不是目标所在的目录。

### 返回值

Promise，兑现成 `undefined`。完成后原位置不再有文件。

- 目标位置已经有文件时的结果**未在模拟器验证**。
- 失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

`from` 或 `to` 不是字符串，或是空字符串：`move: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const from = fs.documents + '/copy.txt';
  await fs.writeText(from, '内容');
  await fs.move(from, fs.documents + '/moved.txt');
  console.log(await fs.exists(from), await fs.readText(fs.documents + '/moved.txt'));
}
demo();
```

**结果**：输出 `false 内容`。

## 对应的 iOS API

`-[NSFileManager moveItemAtPath:toPath:error:]`。

## 参见

- [`copy()`](copy.md)：保留原文件
