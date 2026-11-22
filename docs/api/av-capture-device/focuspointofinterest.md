---
type: reference
native: AVCaptureDevice.focusPointOfInterest
---

# `AVCaptureDevice`：`focusPointOfInterest` 属性

**`focusPointOfInterest`** 属性是对焦点：摄像头对准画面里的哪一处对焦。

## 值

读出来是 [`CGPoint`](../cg-point.md)。写的时候可以给 `CGPoint`，也可以给 `{ x, y }`。

- 可读，可写。
- 坐标是 0 到 1 的比例，不是点（pt）：(0, 0) 是画面的左上角，(1, 1) 是右下角。画面的方向是手机逆时针转 90 度横过来（原来的底边在右手边）时的方向，和竖着拿手机时屏幕上看到的不一样，见[画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)。
- 不要自己换算。用户在取景画面上点了一处，用取景图层的 [`captureDevicePointOfInterestForPoint()`](../av-capture-video-preview-layer/capturedevicepointofinterestforpoint.md) 把图层里的点换成这个比例。
- 默认值是 (0.5, 0.5)，画面正中（实测）。
- 写之前要先调 [`lockForConfiguration()`](lockforconfiguration.md)，写完调 [`unlockForConfiguration()`](unlockforconfiguration.md)。摄像头要支持指定对焦点，见 [`isFocusPointOfInterestSupported`](isfocuspointofinterestsupported.md)。
- 写了之后读回来是写入的值（实测）。
- 写了之后，再写一次 [`focusMode`](focusmode.md)，摄像头才按新的对焦点对焦。对焦的效果**未在真机验证**。
- 它由 App 自己写，变的时候没有事件。

### 写错时

- 没锁就写：抛 [`DOMException`](../dom-exception.md)，`name` 是 `'InvalidStateError'`，值不变（实测）。信息是 `focusPointOfInterest: the system refused (…)`，括号里是系统给的原因，说的是要先锁（`-lockForConfiguration:`）。
- 写的不是对象：抛 `TypeError`：`focusPointOfInterest needs an object with all of: x, y`（实测）。
- 摄像头不支持指定对焦点：系统拒绝，抛 `DOMException`，`name` 是 `'InvalidStateError'`，信息里带系统给的原因。**未在真机验证。**

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.isFocusPointOfInterestSupported) {
  device.lockForConfiguration();
  try {
    device.focusPointOfInterest = { x: 0.25, y: 0.75 };
    device.focusMode = 'autoFocus';
  } finally {
    device.unlockForConfiguration();
  }
  const p = device.focusPointOfInterest;
  console.log(p.x, p.y);
}
```

**效果**：控制台输出 `0.25 0.75`。摄像头对准那一处对一次焦，画面上的效果**未在真机验证**。

## 对应的 iOS API

`AVCaptureDevice.focusPointOfInterest`。ObjC 里没锁就写抛 `NSGenericException`，这里抛 `DOMException`，`name` 是 `'InvalidStateError'`。

## 参见

- [`captureDevicePointOfInterestForPoint()`](../av-capture-video-preview-layer/capturedevicepointofinterestforpoint.md)：从图层里的点换算
- [`focusMode`](focusmode.md)：写了对焦点之后要再写它
- [画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)
