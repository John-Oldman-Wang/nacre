---
type: reference
native: PHPhotoLibrary
status: partial
---

# `PHPhotoLibrary`

**`PHPhotoLibrary`** 表示系统的相册。现在只接了「添加」这一条路：App 把一张图存成相册里的一张新照片，读不到相册里已有的照片。

往相册里存图要用户同意「添加照片」的权限。没问过用户时，存图的方法自己会先弹提示框。

要先装 `@nacrejs/photos`，并且在 `nacre.config.json` 里写 `NSPhotoLibraryAddUsageDescription`，装法见 [`PHPickerViewController`](photos.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`NSObject` → `PHPhotoLibrary`

## 构造函数

不能用 `new` 创建。`new PHPhotoLibrary()` 抛 `TypeError`：

```
Illegal constructor: PHPhotoLibrary is created by the runtime, not by new
```

整个 App 只有一个，从 [`PHPhotoLibrary.sharedPhotoLibrary`](ph-photo-library/sharedphotolibrary.md) 读。

## 静态属性

[`PHPhotoLibrary.sharedPhotoLibrary`](ph-photo-library/sharedphotolibrary.md) <small>只读</small>

系统的相册。两次读是同一个对象。

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`PHPhotoLibrary.authorizationStatusForAccessLevel()`](ph-photo-library/authorizationstatusforaccesslevel.md) | 读现在的授权状态，不弹提示框 |
| [`PHPhotoLibrary.requestAuthorizationForAccessLevel()`](ph-photo-library/requestauthorizationforaccesslevel.md) | 申请权限，返回 Promise |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`performChanges()`](ph-photo-library/performchanges.md) | 修改相册。现在只能存一张新照片 |

## 授权状态

| 取值 | 含义 |
| --- | --- |
| `'notDetermined'` | 还没问过用户 |
| `'authorized'` | 用户同意了 |
| `'denied'` | 用户拒绝了 |
| `'restricted'` | 被系统限制了（家长控制一类），用户自己也改不了 |
| `'limited'` | 用户只给了一部分照片。`'addOnly'` 这个级别不会出现 |

系统只问用户一次。用户拒绝过之后 App 不能再弹提示框，只能请用户到系统的「设置」里打开。状态变了没有事件：用户只能在提示框里或者离开 App 到「设置」里改它，所以在要用的时候读一次。

## 错误

[`performChanges()`](ph-photo-library/performchanges.md) 和 [`requestAuthorizationForAccessLevel()`](ph-photo-library/requestauthorizationforaccesslevel.md) 的 Promise 被拒绝时得到一个 `Error`，类型定义里叫 `PHPhotoLibraryError`。上面多两个字段：`code`（`number`）和 `domain`（`string`），是系统给的错误码和错误域。

| `name` | 什么时候 |
| --- | --- |
| `NotAllowedError` | 用户没同意，或者被系统限制了 |
| `InvalidStateError` | 工程里没写 `NSPhotoLibraryAddUsageDescription`。用 CLI 生成的工程不会出现，生成时就拦住了 |
| `PhotosError` | 别的失败，比如存储空间不够。具体原因看 `message` 和 `code` |

各种情况下的 `code` 和 `domain` **未在模拟器验证**。

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
    console.log('没存成：' + /** @type {Error} */ (err).name);
  }
}
```

**效果**（**未在模拟器验证**）：第一次调用时系统弹权限提示框，上面是 `nacre.config.json` 里写的那句话。点「允许」，控制台输出 `存好了`，系统的「照片」App 里多一张图。点「不允许」，输出 `没存成：NotAllowedError`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `PHPhotoLibrary.sharedPhotoLibrary` | `PHPhotoLibrary.sharedPhotoLibrary` |
| `[PHPhotoLibrary authorizationStatusForAccessLevel:PHAccessLevelAddOnly]` | `PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly')` |
| `[PHPhotoLibrary requestAuthorizationForAccessLevel:PHAccessLevelAddOnly handler:^(PHAuthorizationStatus status) { … }]` | `await PHPhotoLibrary.requestAuthorizationForAccessLevel('addOnly')` |
| `[library performChanges:^{ [PHAssetChangeRequest creationRequestForAssetFromImage:image]; } completionHandler:^(BOOL success, NSError *error) { … }]` | `await library.performChanges({ creationRequestForAssetFromImage: image })` |

最后一行形状不一样。ObjC 的第一个参数是一段代码，要做的修改写在代码里；JS 这边是一个对象，键是要做的那种修改的名字。原因见[实现原理](../internals/photos.md#performchanges-为什么收一个对象)。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读相册里已有的照片、相簿 | `PHAsset`、`PHAssetCollection`、`PHImageManager`，以及 `PHAccessLevelReadWrite`。要完整的相册权限 |
| 相册变了时得到通知 | `PHPhotoLibraryChangeObserver` |
| 把视频、文件里的图片存进相册，删除和修改照片 | `PHAssetChangeRequest` 的其余方法、`PHAssetCreationRequest` |
| 存进去之后拿到那张新照片 | `PHObjectPlaceholder`。要完整的相册权限才用得上 |

## 参见

- [从相册选图、把图存进相册](../guides/pick-photos.md#把图存进相册)：存图、先看权限、被拒之后提示用户
- [`PHPickerViewController`](photos.md)：让用户挑照片，不需要权限
- [配置 App](../guides/project-config.md#写权限文案)：权限文案写在哪、怎么按语言写
- [`UIImage`](ui-image.md)：要存的图片的类型
