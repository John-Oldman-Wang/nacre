---
type: reference
native: UIImagePickerController.sourceType
---

# `UIImagePickerController`：`sourceType` 属性

**`sourceType`** 属性表示拍照界面的图片从哪来。这个包只支持相机，所以只能写 `'camera'`。

## 值

读：下面三个字符串之一。写：只能写 `'camera'`。

| 取值 | 含义 | 能不能写 |
| --- | --- | --- |
| `'camera'` | 相机 | 能 |
| `'photoLibrary'`、`'savedPhotosAlbum'` | 相册，两种列法 | 不能，抛 `TypeError` |

- 可读，可写。
- 默认值是 `'photoLibrary'`，这是系统的默认值。新建之后必须写成 `'camera'`，它才是拍照界面。没写就弹出来，出现的是系统选照片的界面（**未验证**）。
- 重复写 `'camera'` 不抛。
- 只有 App 自己能改，所以没有变化通知。

### 写错时

两种情况抛 `TypeError`，抛了之后原来的值不变：

- 写了相册的两个值：

  ```
  sourceType "photoLibrary" is not supported: @nacrejs/camera only takes photos with the camera (sourceType "camera"). Picking from the photo library is a separate package, @nacrejs/photos
  ```

- 相机这种来源在这台设备上不可用（[`isSourceTypeAvailable('camera')`](issourcetypeavailable.md) 是 `false`）：

  ```
  sourceType "camera" is not available on this device. Check UIImagePickerController.isSourceTypeAvailable("camera") first
  ```

  这一条**未在模拟器验证**：模拟器上这种来源是可用的，写 `'camera'` 不抛。

写了别的值（不是 `'camera'`，也不是相册的两个值，包括数字和 `null`）：不抛异常，控制台输出一条警告，属性保持原来的值。

```
[Nacre] sourceType has no value "video"; expected one of: camera, ignored
```

## 示例

```js
const picker = new UIImagePickerController();
if (UIImagePickerController.isSourceTypeAvailable('camera')) {
  picker.sourceType = 'camera';
}
console.log(picker.sourceType);
```

**结果**：相机这种来源可用时输出 `camera`（模拟器上也是），不可用时输出 `photoLibrary`。

## 对应的 iOS API

`UIImagePickerController.sourceType`。`UIImagePickerControllerSourceTypeCamera` 写成 `'camera'`。ObjC 里来源不可用时写它会抛异常、App 直接终止（Apple 文档的说法，**未验证**）；这里是能 `catch` 的 `TypeError`。

## 参见

- [来源](../ui-image-picker-controller.md#来源)
- [`isSourceTypeAvailable()`](issourcetypeavailable.md)
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
