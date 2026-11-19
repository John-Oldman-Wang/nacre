---
type: reference
native: "NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, …)"
---

# `FileSystem`：`applicationSupport` 属性

**`applicationSupport`** 属性是 App 自己的数据（数据库、状态文件）所在目录的绝对路径。

## 值

字符串。以 `/` 开头，末尾不带 `/`，和另外三个目录互不相同。

- 只读。给它赋值抛 `TypeError`。
- 在 App 运行期间不变，所以没有变化通知。
- 系统会不会删里面的文件：不会。
- 是否进入备份：是。

「系统会不会删」和「是否进入备份」两条来自 iOS 的定义，**未在模拟器验证**。

这个目录在 App 第一次运行时是否已经存在，**未在模拟器验证**。往里面写文件之前先调一次 [`makeDirectory(fs.applicationSupport)`](makedirectory.md)，目录已经存在时这个调用不报错。

## 示例

```js
async function save() {
  const fs = application.fileSystem;
  await fs.makeDirectory(fs.applicationSupport);
  await fs.writeText(fs.applicationSupport + '/state.json', '{}');
  console.log(await fs.exists(fs.applicationSupport + '/state.json'));
}
save();
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, …)`。

## 参见

- [选哪个目录](../../guides/files.md#选哪个目录)
