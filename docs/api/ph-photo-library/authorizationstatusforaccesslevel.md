---
type: reference
native: "+[PHPhotoLibrary authorizationStatusForAccessLevel:]"
---

# `PHPhotoLibrary.authorizationStatusForAccessLevel()` 静态方法

**`PHPhotoLibrary.authorizationStatusForAccessLevel()`** 静态方法读现在的相册授权状态。它只是读，不会弹提示框。

## 语法

```
PHPhotoLibrary.authorizationStatusForAccessLevel(accessLevel)
```

### 参数

**`accessLevel`**

只有一个取值 `'addOnly'`：往相册里添加的权限。

### 返回值

字符串，见[授权状态](../ph-photo-library.md#授权状态)：`'notDetermined'`、`'authorized'`、`'denied'`、`'restricted'`、`'limited'` 之一。`'addOnly'` 这个级别不会是 `'limited'`。

状态变了没有事件。在要用的时候读一次。

### 异常

**`TypeError`**

`accessLevel` 写别的值。写 `'readWrite'` 时：

```
accessLevel "readWrite" is not supported: reading the photo library needs a different usage description; expected one of: addOnly. To let the user choose photos, use PHPickerViewController, which needs no permission
```

## 示例

```js
const saveButton = UIButton.buttonWithType('system');
const status = PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly');
saveButton.isEnabled = status !== 'denied' && status !== 'restricted';
```

**效果**：用户拒绝过、或者被系统限制时，按钮是灰的。读状态不会弹提示框。

## 对应的 iOS API

`+[PHPhotoLibrary authorizationStatusForAccessLevel:]`。`PHAccessLevelAddOnly` 写成 `'addOnly'`；`PHAccessLevelReadWrite` 没有接。

## 参见

- [`requestAuthorizationForAccessLevel()`](requestauthorizationforaccesslevel.md)：申请权限
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
