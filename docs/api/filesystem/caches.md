---
type: reference
native: "NSSearchPathForDirectoriesInDomains(NSCachesDirectory, …)"
---

# `FileSystem`：`caches` 属性

**`caches`** 属性是能重新得到的内容（下载的图片、接口返回的缓存）所在目录的绝对路径。

## 值

字符串。以 `/` 开头，末尾不带 `/`，和另外三个目录互不相同。

- 只读。给它赋值抛 `TypeError`。
- 在 App 运行期间不变，所以没有变化通知。
- 系统会不会删里面的文件：设备存储空间不足时会删。
- 是否进入备份：否。

「系统会不会删」和「是否进入备份」两条来自 iOS 的定义，**未在模拟器验证**。

系统可能已经删了这里的文件。读这里的文件之前先用 [`exists()`](exists.md) 判断它还在不在，不在就重新下载。

## 示例

```js
const fs = application.fileSystem;
const imagePath = fs.caches + '/images/avatar.png';
console.log(imagePath.startsWith(fs.caches));
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSSearchPathForDirectoriesInDomains(NSCachesDirectory, …)`。

## 参见

- [选哪个目录](../../guides/files.md#选哪个目录)
