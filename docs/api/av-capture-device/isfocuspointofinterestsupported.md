---
type: reference
native: AVCaptureDevice.focusPointOfInterestSupported
---

# `AVCaptureDevice`：`isFocusPointOfInterestSupported` 属性

**`isFocusPointOfInterestSupported`** 属性表示这个摄像头支不支持指定对焦点，也就是能不能用 [`focusPointOfInterest`](focuspointofinterest.md) 让它对准画面里的某一处。

## 值

布尔值。

- `true`：支持。iPhone 14 的后置摄像头是 `true`（实测）。
- `false`：不支持。这时写 `focusPointOfInterest` 会被系统拒绝，抛 `DOMException`，`name` 是 `'InvalidStateError'`（**未在真机验证**）。
- 只读。给它赋值抛 `TypeError`。
- 一个摄像头的这个值不会变，所以没有变化事件。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.isFocusPointOfInterestSupported) {
  console.log('可以点哪儿对焦哪儿');
}
```

**效果**：iPhone 14 上输出 `可以点哪儿对焦哪儿`。

## 对应的 iOS API

`AVCaptureDevice.focusPointOfInterestSupported`，ObjC 的 getter 是 `isFocusPointOfInterestSupported`。

## 参见

- [`focusPointOfInterest`](focuspointofinterest.md)：对焦点
