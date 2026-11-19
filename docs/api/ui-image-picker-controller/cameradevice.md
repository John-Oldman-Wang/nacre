---
type: reference
native: UIImagePickerController.cameraDevice
---

# `UIImagePickerController`：`cameraDevice` 属性

**`cameraDevice`** 属性表示拍照界面打开时用哪个摄像头。用户在拍照界面上还可以自己切换。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'rear'` | 打开时用背面的摄像头 |
| `'front'` | 打开时用屏幕这一面的摄像头 |

- 可读，可写。只在 [`sourceType`](sourcetype.md) 是 `'camera'` 时能读写。
- 默认值是 `'rear'`。模拟器没有摄像头，读出来也是 `'rear'`。
- 写成一个存在的摄像头之后读回来**未验证**。
- 打开之后用户切换了摄像头，读出来跟不跟着变**未验证**。没有变化通知。

### 写错时

- `sourceType` 不是 `'camera'` 时，读和写都抛 `TypeError`：

  ```
  cameraDevice is only available when sourceType is "camera"; set sourceType first
  ```

- 写了这台设备没有的摄像头：抛 `TypeError`，原来的值不变。模拟器上写 `'front'` 就是这样：

  ```
  cameraDevice "front" is not available on this device. Check UIImagePickerController.isCameraDeviceAvailable("front") first
  ```

- 写了表里没有的值：不抛异常，控制台输出一条警告，属性保持原来的值。警告结尾是 `expected one of: rear / front, ignored`。
- 系统自己拒绝了这次读写：抛 `TypeError`，`message` 以属性名开头，后面是系统给的原因。什么情况下会这样**未验证**。

## 示例

```js
const picker = new UIImagePickerController();
if (UIImagePickerController.isSourceTypeAvailable('camera')) {
  picker.sourceType = 'camera';
  if (UIImagePickerController.isCameraDeviceAvailable('front')) {
    picker.cameraDevice = 'front';
  }
}
```

**效果**（**未验证**）：有前置摄像头的设备上，拍照界面打开时显示的是屏幕这一面摄像头的画面。

## 对应的 iOS API

`UIImagePickerController.cameraDevice`。`UIImagePickerControllerCameraDeviceRear` 写成 `'rear'`，`UIImagePickerControllerCameraDeviceFront` 写成 `'front'`。

## 参见

- [`isCameraDeviceAvailable()`](iscameradeviceavailable.md)：先问有没有这个摄像头
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
