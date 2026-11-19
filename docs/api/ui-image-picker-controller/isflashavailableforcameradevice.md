---
type: reference
native: "+[UIImagePickerController isFlashAvailableForCameraDevice:]"
---

# `UIImagePickerController.isFlashAvailableForCameraDevice()` 静态方法

**`UIImagePickerController.isFlashAvailableForCameraDevice()`** 静态方法查询某个摄像头有没有闪光灯。

## 语法

```
UIImagePickerController.isFlashAvailableForCameraDevice(cameraDevice)
```

### 参数

**`cameraDevice`**

摄像头，`'rear'`（背面的）或者 `'front'`（屏幕这一面的）。

### 返回值

布尔。`true`：这个摄像头有闪光灯。`false`：没有。

模拟器上两个都是 `false`。有摄像头的真机上的结果**未验证**。

### 异常

**`TypeError`**

`cameraDevice` 不是 `'rear'` 或 `'front'`。报错里列出能写的值。

## 示例

```js
if (UIImagePickerController.isFlashAvailableForCameraDevice('rear')) {
  console.log('后置摄像头有闪光灯');
}
```

**效果**：后置摄像头有闪光灯时输出一行。模拟器上不输出。

## 对应的 iOS API

`+[UIImagePickerController isFlashAvailableForCameraDevice:]`。

## 参见

- [`cameraFlashMode`](cameraflashmode.md)：闪光灯的模式
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
