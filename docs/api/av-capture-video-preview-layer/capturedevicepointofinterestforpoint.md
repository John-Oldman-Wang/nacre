---
type: reference
native: "-[AVCaptureVideoPreviewLayer captureDevicePointOfInterestForPoint:]"
---

# `AVCaptureVideoPreviewLayer`：`captureDevicePointOfInterestForPoint()` 方法

**`captureDevicePointOfInterestForPoint()`** 方法把这个图层里的一个点换算成摄像头的 [`focusPointOfInterest`](../av-capture-device/focuspointofinterest.md) 用的比例。用它实现「点哪里对焦哪里」。

## 语法

```
captureDevicePointOfInterestForPoint(point)
```

### 参数

**`point`**

图层里的一个点，单位 pt，原点在图层左上角。可以是 [`CGPoint`](../cg-point.md)，也可以是带 `x`、`y` 两个数的普通对象。

### 返回值

一个 [`CGPoint`](../cg-point.md)（实测），数值是 0 到 1 的比例，见[画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)。

实测：会话在取景、画面铺满 180 × 240 pt 的图层时，图层正中 `(90, 120)` 换算成 `(0.5, 0.5)`。

结果取决于会话现在的画面，在会话开始取景之后再算。开始取景之前算出来的值**未在真机验证**。

反过来换算用 [`pointForCaptureDevicePointOfInterest()`](pointforcapturedevicepointofinterest.md)。

### 异常

**`TypeError`**

- `point` 不是对象：`captureDevicePointOfInterestForPoint needs an object with all of: x, y`（实测传数时抛）。
- 少了某个字段，或者某个字段不是有限数：`captureDevicePointOfInterestForPoint is missing …, or it is not a finite number`。

## 示例

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const preview = new AVCaptureVideoPreviewLayer(session);
  preview.videoGravity = 'resizeAspectFill';
  preview.frame = new CGRect(0, 0, 180, 240);

  session.startRunning().then(() => {
    const point = preview.captureDevicePointOfInterestForPoint({ x: 90, y: 120 });
    console.log(point.x.toFixed(2), point.y.toFixed(2));
  });
}
```

**效果**：已经授权时，会话开始取景之后，控制台输出 `0.50 0.50`。

## 对应的 iOS API

`-[AVCaptureVideoPreviewLayer captureDevicePointOfInterestForPoint:]`。

## 参见

- [`focusPointOfInterest`](../av-capture-device/focuspointofinterest.md)：把换算出来的点设成对焦点
- [`pointForCaptureDevicePointOfInterest()`](pointforcapturedevicepointofinterest.md)：反过来换算
