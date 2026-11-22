---
type: reference
native: "-[AVCaptureVideoPreviewLayer pointForCaptureDevicePointOfInterest:]"
---

# `AVCaptureVideoPreviewLayer`：`pointForCaptureDevicePointOfInterest()` 方法

**`pointForCaptureDevicePointOfInterest()`** 方法把画面里一个 0 到 1 的比例坐标换算成这个图层里的点。它是 [`captureDevicePointOfInterestForPoint()`](capturedevicepointofinterestforpoint.md) 的反向换算。

## 语法

```
pointForCaptureDevicePointOfInterest(point)
```

### 参数

**`point`**

画面里的一个点，数值是 0 到 1 的比例，见[画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)。比如摄像头现在的 [`focusPointOfInterest`](../av-capture-device/focuspointofinterest.md)。可以是 [`CGPoint`](../cg-point.md)，也可以是带 `x`、`y` 两个数的普通对象。

### 返回值

一个 [`CGPoint`](../cg-point.md)：这个图层里的点，单位 pt，原点在图层左上角。

实测：会话在取景、画面铺满 180 × 240 pt 的图层时，`(0.5, 0.5)` 换算回 `(90, 120)`，误差不到 1 pt。

结果取决于会话现在的画面，在会话开始取景之后再算。开始取景之前算出来的值**未在真机验证**。

### 异常

**`TypeError`**

- `point` 不是对象：`pointForCaptureDevicePointOfInterest needs an object with all of: x, y`。
- 少了某个字段，或者某个字段不是有限数：`pointForCaptureDevicePointOfInterest is missing …, or it is not a finite number`。

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
    const point = preview.pointForCaptureDevicePointOfInterest({ x: 0.5, y: 0.5 });
    console.log(Math.round(point.x), Math.round(point.y));
  });
}
```

**效果**：已经授权时，会话开始取景之后，控制台输出 `90 120`：画面的正中在图层的正中。

## 对应的 iOS API

`-[AVCaptureVideoPreviewLayer pointForCaptureDevicePointOfInterest:]`。

## 参见

- [`captureDevicePointOfInterestForPoint()`](capturedevicepointofinterestforpoint.md)：从图层换算到画面
- [`focusPointOfInterest`](../av-capture-device/focuspointofinterest.md)
