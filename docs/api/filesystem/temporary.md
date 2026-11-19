---
type: reference
native: NSTemporaryDirectory()
---

# `FileSystem`：`temporary` 属性

**`temporary`** 属性是用完就不要的临时文件所在目录的绝对路径。

## 值

字符串。以 `/` 开头，末尾不带 `/`，和另外三个目录互不相同。

- 只读。给它赋值抛 `TypeError`。
- 在 App 运行期间不变，所以没有变化通知。
- 系统会不会删里面的文件：随时可能删。
- 是否进入备份：否。

「系统会不会删」和「是否进入备份」两条来自 iOS 的定义，**未在模拟器验证**。

## 示例

```js
const fs = application.fileSystem;
console.log(fs.temporary !== fs.caches);
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSTemporaryDirectory()`。

## 参见

- [选哪个目录](../../guides/files.md#选哪个目录)
