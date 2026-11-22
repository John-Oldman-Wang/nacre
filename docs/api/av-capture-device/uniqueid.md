---
type: reference
native: AVCaptureDevice.uniqueID
---

# `AVCaptureDevice`：`uniqueID` 属性

**`uniqueID`** 属性是这个摄像头的唯一标识。

## 值

字符串，不是空串（实测）。

- 只读。给它赋值抛 `TypeError`。
- 同一台设备上，App 重新启动之后同一个摄像头的标识不变。这一条**未在真机验证**。
- 用它记住用户上次选的是哪个摄像头。不要把它当成给人看的名字，给人看的是 [`localizedName`](localizedname.md)。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  application.storage.set('camera', device.uniqueID);
}
```

**效果**：把默认摄像头的标识存进本地存储，下次启动时可以读出来对比。

## 对应的 iOS API

`AVCaptureDevice.uniqueID`。

## 参见

- [`localizedName`](localizedname.md)：给人看的名字
