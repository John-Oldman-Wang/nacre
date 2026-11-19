---
type: reference
native: "-[NSFileManager contentsOfDirectoryAtPath:error:]"
---

# `FileSystem`：`readDirectory()` 方法

**`readDirectory()`** 方法列出一个目录里各项的名字。

## 语法

```
readDirectory(path)
```

### 参数

**`path`**

目录的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

### 返回值

Promise，兑现成字符串数组。

- 得到的是名字，不是完整路径。
- 只列这一层，不包含子目录里面的内容。子目录本身的名字在里面。
- 名字按什么顺序排列**未在模拟器验证**，需要固定的顺序时自己排序。
- 目录不存在时 Promise 被拒绝，`name` 是 `'NotFoundError'`。其他失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

`path` 不是字符串，或是空字符串：`readDirectory: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const listDir = fs.documents + '/list-demo';
  await fs.makeDirectory(listDir + '/sub');
  await fs.writeText(listDir + '/a.txt', 'a');

  const names = await fs.readDirectory(listDir);
  console.log(names.slice().sort().join(','));
}
demo();
```

**结果**：输出 `a.txt,sub`。

## 对应的 iOS API

`-[NSFileManager contentsOfDirectoryAtPath:error:]`。

## 参见

- [`stat()`](stat.md)：判断某一项是不是目录
