---
type: reference
native: "-[NSFileManager removeItemAtPath:error:]"
---

# `FileSystem`：`remove()` 方法

**`remove()`** 方法删除一个文件，或者删除一个目录连同里面的所有内容。

## 语法

```
remove(path)
```

### 参数

**`path`**

要删除的文件或目录的绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

### 返回值

Promise，兑现成 `undefined`。

- 路径是目录时，目录连同里面的所有内容一起删除。
- 路径不存在时 Promise 被拒绝。`name` 的取值**未在模拟器验证**。
- 其他失败的情况见[出错时得到什么](../filesystem.md#出错时得到什么)。

### 异常

**`TypeError`**

`path` 不是字符串，或是空字符串：`remove: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const dir = fs.temporary + '/to-remove';
  await fs.makeDirectory(dir);
  await fs.writeText(dir + '/a.txt', 'a');

  await fs.remove(dir);
  console.log(await fs.exists(dir));
}
demo();
```

**结果**：输出 `false`。目录和里面的 `a.txt` 都被删除。

## 对应的 iOS API

`-[NSFileManager removeItemAtPath:error:]`。

## 参见

- [`exists()`](exists.md)：删除前先判断在不在，避免被拒绝
