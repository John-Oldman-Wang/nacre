---
type: reference
native: "-[PHPhotoLibrary performChanges:completionHandler:]"
---

# `PHPhotoLibrary`：`performChanges()` 方法

**`performChanges()`** 方法修改相册。现在只有一种修改：把一张图存成相册里的一张新照片。

## 语法

```
performChanges({ creationRequestForAssetFromImage })
```

### 参数

**`changes.creationRequestForAssetFromImage`**

要存的图片，一个 [`UIImage`](../ui-image.md)，必填。任何来源的 `UIImage` 都可以存：打包的、下载的、从选图界面取出来的。

### 返回值

`Promise`，存好之后兑现成 `undefined`。

- 没问过用户时先弹权限提示框，用户同意之后再存。
- 用户拒绝过之后不再弹提示框，Promise 直接被拒绝。

Promise 被拒绝时得到一个 `Error`，`name` 是 `NotAllowedError`、`InvalidStateError` 或 `PhotosError`，带 `code` 和 `domain`，见[错误](../ph-photo-library.md#错误)。

存图的结果**未在模拟器验证**。

### 异常

**`TypeError`**

参数不对时同步抛出，不是拒绝 Promise：

| 写法 | 报错 |
| --- | --- |
| `performChanges()` | `performChanges needs { creationRequestForAssetFromImage: image }, got undefined` |
| `performChanges({})` | `performChanges needs { creationRequestForAssetFromImage: image }` |
| 图片不是 `UIImage` | `creationRequestForAssetFromImage must be a UIImage, got "dot.png"` |
| 对象里有别的键 | `performChanges does not support "deleteAssets" yet; the only supported change is creationRequestForAssetFromImage` |

## 示例

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  try {
    await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
      creationRequestForAssetFromImage: photo,
    });
    console.log('存好了');
  } catch (err) {
    const error = /** @type {PHPhotoLibraryError} */ (err);
    console.log(error.name === 'NotAllowedError' ? '请到「设置」里允许添加照片' : error.message);
  }
}
```

**效果**（**未在模拟器验证**）：第一次调用时系统弹权限提示框。用户同意之后，相册里多一张新照片，控制台输出 `存好了`。用户拒绝，输出提示去设置的那一句。

## 对应的 iOS API

`-[PHPhotoLibrary performChanges:completionHandler:]` 里调 `+[PHAssetChangeRequest creationRequestForAssetFromImage:]`。ObjC 的第一个参数是一段代码，JS 这里是一个对象，键是要做的那种修改的名字。原因见[实现原理](../../internals/photos.md#performchanges-为什么收一个对象)。完成回调换成了 Promise。

## 参见

- [`sharedPhotoLibrary`](sharedphotolibrary.md)：拿到相册
- [从相册选图、把图存进相册](../../guides/pick-photos.md#把图存进相册)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
