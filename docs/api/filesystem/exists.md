---
type: reference
native: "-[NSFileManager fileExistsAtPath:]"
---

# `FileSystem`：`exists()` 方法

**`exists()`** 方法判断路径上有没有文件或目录。

## 语法

```
exists(path)
```

### 参数

**`path`**

绝对路径，非空字符串。见[路径](../filesystem.md#路径)。

### 返回值

Promise，兑现成布尔值：路径上有文件或目录时是 `true`，没有时是 `false`。路径不存在时得到 `false`，不拒绝。

### 异常

**`TypeError`**

`path` 不是字符串，或是空字符串：`exists: path must be a non-empty string`。这时当场抛出，不返回 Promise。

## 示例

```js
async function demo() {
  const fs = application.fileSystem;
  const settingsPath = fs.documents + '/settings.json';

  let settingsText = '{}';
  if (await fs.exists(settingsPath)) {
    settingsText = await fs.readText(settingsPath);
  }
  console.log(settingsText);
}
demo();
```

**结果**：文件存在时输出它的内容，不存在时输出 `{}`。

## 对应的 iOS API

`-[NSFileManager fileExistsAtPath:]`。

## 参见

- [`stat()`](stat.md)：还要知道是不是目录、多大
