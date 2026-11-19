---
type: reference
native: "+[UIImagePickerController isCameraDeviceAvailable:]"
---

# `UIImagePickerController.isCameraDeviceAvailable()` 静态方法

**`UIImagePickerController.isCameraDeviceAvailable()`** 静态方法查询这台设备有没有某个摄像头。

## 语法

```
UIImagePickerController.isCameraDeviceAvailable(cameraDevice)
```

### 参数

**`cameraDevice`**

摄像头，下面两个字符串之一：

| 取值 | 含义 |
| --- | --- |
| `'rear'` | 背面的摄像头 |
| `'front'` | 屏幕这一面的摄像头 |

### 返回值

布尔。`true`：有这个摄像头。`false`：没有。

模拟器上两个都是 `false`。有摄像头的真机上的结果**未验证**。

### 异常

**`TypeError`**

`cameraDevice` 不是上表里的值。报错里列出能写的值：

```
isCameraDeviceAvailable has no value "back"; expected one of: rear / front
```

## 示例

```js
const hasCamera = UIImagePickerController.isCameraDeviceAvailable('rear') ||
                  UIImagePickerController.isCameraDeviceAvailable('front');
console.log(hasCamera);
```

**结果**：模拟器上输出 `false`。

## 对应的 iOS API

`+[UIImagePickerController isCameraDeviceAvailable:]`。`UIImagePickerControllerCameraDeviceRear` 写成 `'rear'`，`UIImagePickerControllerCameraDeviceFront` 写成 `'front'`。

## 参见

- [`isSourceTypeAvailable()`](issourcetypeavailable.md)：相机这种来源可不可用
- [`cameraDevice`](cameradevice.md)：打开时用哪个摄像头
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
