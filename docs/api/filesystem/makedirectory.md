---
type: reference
native: "-[NSFileManager createDirectoryAtPath:withIntermediateDirectories:attributes:error:]"
---

# `FileSystem`：`makeDirectory()` 方法

**`makeDirectory()`** 方法建一个目录，连同中间各层一起建。

## 语法

```
makeDirectory(path)
```

### 参数

**`path`**

要建的目录的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

### 返回值

Promise，兑现成 `undefined`。

- 中间各层不存在时一起建。
- 目录已经存在时不报错。所以每次写文件之前调用一次是安全的。
- 失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

`path` 不是字符串，或是空字符串：`makeDirectory: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const dir = fs.documents + '/a/b/c';
  await fs.makeDirectory(dir);
  await fs.makeDirectory(dir);
  console.log((await fs.stat(dir)).isDirectory);
}
demo();
```

**结果**：输出 `true`。第二次调用时目录已经存在，不报错。

## 对应的 iOS API

`-[NSFileManager createDirectoryAtPath:withIntermediateDirectories:attributes:error:]`，`withIntermediateDirectories` 是 `YES`。

## 参见

- [`writeText()`](writetext.md)：写文件不会自动建目录
- [`remove()`](remove.md)：删除目录
