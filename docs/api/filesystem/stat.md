---
type: reference
native: "-[NSFileManager attributesOfItemAtPath:error:]"
---

# `FileSystem`：`stat()` 方法

**`stat()`** 方法查询一个文件或目录的信息：大小、是不是目录、最后修改时间。

## 语法

```
stat(path)
```

### 参数

**`path`**

绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

### 返回值

Promise，兑现成一个对象（类型定义里叫 `FileStat`）：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `size` | `number` | 文件的字节数。路径是目录时这个值的含义**未在模拟器验证** |
| `isDirectory` | `boolean` | 是目录时为 `true`，是文件时为 `false` |
| `modified` | `number` | 最后修改时间，毫秒时间戳。用 `new Date(info.modified)` 得到日期 |

路径不存在时 Promise 被拒绝，`name` 是 `'NotFoundError'`。其他失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

`path` 不是字符串，或是空字符串：`stat: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const path = fs.temporary + '/first.txt';
  await fs.writeText(path, '你好 Nacre');
  const info = await fs.stat(path);
  console.log(info.size, info.isDirectory, new Date(info.modified).getFullYear() > 2000);
}
demo();
```

**结果**：输出 `12 false true`。两个汉字各占 3 字节，其余 6 个字符各占 1 字节。

## 对应的 iOS API

`-[NSFileManager attributesOfItemAtPath:error:]`。`NSFileSize`、`NSFileType`、`NSFileModificationDate` 三项写成 `size`、`isDirectory`、`modified`。

## 参见

- [`exists()`](exists.md)：只判断在不在
