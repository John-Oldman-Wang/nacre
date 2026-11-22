---
type: reference
native: AVCaptureDevice.localizedName
---

# `AVCaptureDevice`：`localizedName` 属性

**`localizedName`** 属性是这个摄像头给人看的名字，用来显示在界面上，比如让用户挑一个摄像头时。

## 值

字符串，不是空串（实测）。

- 只读。给它赋值抛 `TypeError`。
- 由系统给出，按系统的语言。iPhone 14 的后置摄像头上实测是 `Back Camera`。别的语言下的写法**未在真机验证**。
- 名字会随语言变，不要拿它判断是哪个摄像头。判断用 [`position`](position.md)，记住用 [`uniqueID`](uniqueid.md)。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
console.log(device === null ? '没有摄像头' : device.localizedName);
```

**效果**：iPhone 14 上输出 `Back Camera`。

## 对应的 iOS API

`AVCaptureDevice.localizedName`。

## 参见

- [`uniqueID`](uniqueid.md)：不随语言变的标识
