---
type: reference
native: PHPhotoLibrary.sharedPhotoLibrary
---

# `PHPhotoLibrary.sharedPhotoLibrary` 静态属性

**`PHPhotoLibrary.sharedPhotoLibrary`** 静态属性是系统的相册。整个 App 只有这一个。

## 值

`PHPhotoLibrary`。

- 只读。给它赋值抛 `TypeError`。
- 两次读是同一个对象。

## 示例

```js
const library = PHPhotoLibrary.sharedPhotoLibrary;
console.log(library === PHPhotoLibrary.sharedPhotoLibrary);
```

**结果**：输出 `true`。

## 对应的 iOS API

`PHPhotoLibrary.sharedPhotoLibrary`。

## 参见

- [`performChanges()`](performchanges.md)：往相册里存图
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
