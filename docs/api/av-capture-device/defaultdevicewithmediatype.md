---
type: reference
native: "+[AVCaptureDevice defaultDeviceWithMediaType:]"
---

# `AVCaptureDevice.defaultDeviceWithMediaType()` 静态方法

**`AVCaptureDevice.defaultDeviceWithMediaType()`** 静态方法返回这台设备默认的摄像头。

## 语法

```
AVCaptureDevice.defaultDeviceWithMediaType(mediaType)
```

### 参数

**`mediaType`**

媒体类型，只能是 `'video'`（摄像头）。

### 返回值

一个 `AVCaptureDevice`，没有摄像头时是 `null`。

- iPhone 上是背面的广角摄像头。iPhone 14 上实测：[`localizedName`](localizedname.md) 是 `Back Camera`，[`position`](position.md) 是 `'back'`。
- 每次调用得到同一个对象（实测）。
- 不需要先申请授权。拿到摄像头对象不会弹提示框。

### 异常

**`TypeError`**

`mediaType` 不是 `'video'`：`defaultDeviceWithMediaType has no value "audio"; expected one of: video`。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device === null) {
  console.log('这台设备没有摄像头');
} else {
  console.log(device.localizedName, device.position);
}
```

**效果**：iPhone 14 上输出 `Back Camera back`。

## 对应的 iOS API

`+[AVCaptureDevice defaultDeviceWithMediaType:]`。`AVMediaTypeVideo` 写成 `'video'`。

## 参见

- [`defaultDeviceWithDeviceType()`](defaultdevicewithdevicetype.md)：按种类和朝向找，比如前置摄像头
- [`AVCaptureDeviceInput()`](../av-capture-device-input/constructor.md)：把摄像头接进会话
