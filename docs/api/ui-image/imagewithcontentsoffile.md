---
type: reference
native: "+[UIImage imageWithContentsOfFile:]"
---

# `UIImage.imageWithContentsOfFile()` 静态方法

**`UIImage.imageWithContentsOfFile()`** 静态方法从设备上的一个文件读取图片。

## 语法

```
UIImage.imageWithContentsOfFile(path)
```

### 参数

**`path`**

字符串。文件的完整绝对路径。目录的路径从[文件读写](../filesystem.md)取得，比如 `application.fileSystem.caches`。不是字符串时按 `String()` 转。

### 返回值

`UIImage`。文件不存在或不是图片时返回 `null`，不抛异常。

只读取真实的文件，不查 Asset Catalog。

### 异常

无。

## 示例

```js
const path = application.fileSystem.caches + '/cover.jpg';
const img = UIImage.imageWithContentsOfFile(path);
console.log(img === null ? '没有这个文件' : img.size.width);
```

**结果**：缓存目录里有 `cover.jpg` 时输出它的宽度，单位 pt；没有时输出 `没有这个文件`。**未在模拟器验证。**

## 对应的 iOS API

`+[UIImage imageWithContentsOfFile:]`。

## 参见

- [文件读写](../filesystem.md)
- [显示图片](../../guides/images.md)：先下载保存、以后从文件读的写法
