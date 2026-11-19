---
type: reference
native: "-[NSString writeToFile:atomically:encoding:error:]"
---

# `FileSystem`：`writeText()` 方法

**`writeText()`** 方法按 UTF-8 把文本写进文件，替换整个文件。

## 语法

```
writeText(path, text)
```

### 参数

**`path`**

文件的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

**`text`**

要写入的文本，字符串。

### 返回值

Promise，兑现成 `undefined`。Promise 完成时文件已经写好，紧接着读能读到新内容。

- 文件不存在时创建，已经存在时覆盖。没有追加写入：要在文件末尾加内容，先读出来，拼好，再整个写回去。
- 写入先在旁边写好一个完整的新文件，再用它替换原文件。写到一半时 App 被结束，原文件保持原来的内容（来自 iOS 的定义，**未在模拟器验证**）。
- 不会自动创建所在的目录。目录不存在时 Promise 被拒绝，`name` 的取值**未在模拟器验证**。写之前先用 [`makeDirectory()`](makedirectory.md) 建好目录。
- 对同一个文件连续发起两次写入而不等待第一次完成，最后留下的是哪一次的内容不确定（读代码得出，**未在模拟器验证**）。对同一个文件的操作要用 `await` 一个一个做。

其他失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

这时当场抛出，不返回 Promise。

- `path` 不是字符串，或是空字符串：`writeText: path must be a non-empty string`。
- `text` 不是字符串：`writeText: the second argument must be a string`。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const path = fs.temporary + '/note.txt';
  await fs.writeText(path, '第一版');
  await fs.writeText(path, '第二版');
  console.log(await fs.readText(path));
}
demo();
```

**结果**：输出 `第二版`。第二次写入替换了整个文件。

## 对应的 iOS API

`-[NSString writeToFile:atomically:encoding:error:]`，`atomically` 是 `YES`，编码是 UTF-8。

## 参见

- [`writeBytes()`](writebytes.md)：写二进制内容
- [`makeDirectory()`](makedirectory.md)：先建目录
