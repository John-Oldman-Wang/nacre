---
type: reference
native: "NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, …)"
---

# `FileSystem`：`documents` 属性

**`documents`** 属性是用户创建的内容（笔记、导出的文件）所在目录的绝对路径。

## 值

字符串。以 `/` 开头，末尾不带 `/`，和另外三个目录互不相同。

- 只读。给它赋值抛 `TypeError`。
- 在 App 运行期间不变，所以没有变化通知。
- 系统会不会删里面的文件：不会。
- 是否进入备份：是。

「系统会不会删」和「是否进入备份」两条来自 iOS 的定义，**未在模拟器验证**。

App 进程结束后重新启动，这个目录里的文件还在：验收里第一次运行写一个文件，第二次启动读到了它。

## 示例

```js
const fs = application.fileSystem;
console.log(fs.documents.startsWith('/'), fs.documents.endsWith('/'));
```

**结果**：输出 `true false`。

## 对应的 iOS API

`NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, …)`。

## 参见

- [选哪个目录](../../guides/files.md#选哪个目录)
