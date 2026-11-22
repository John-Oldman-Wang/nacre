---
type: reference
native: "-[AVCaptureVideoPreviewLayer metadataOutputRectOfInterestForRect:]"
---

# `AVCaptureVideoPreviewLayer`：`metadataOutputRectOfInterestForRect()` 方法

**`metadataOutputRectOfInterestForRect()`** 方法把这个图层里的一个矩形换算成元数据输出的 [`rectOfInterest`](../av-capture-metadata-output/rectofinterest.md) 用的比例。用它让输出只认屏幕上扫描框里的码。

## 语法

```
metadataOutputRectOfInterestForRect(rect)
```

### 参数

**`rect`**

图层里的一个矩形，单位 pt，原点在图层左上角。可以是 [`CGRect`](../cg-rect.md)，也可以是带 `x`、`y`、`width`、`height` 四个数的普通对象。

### 返回值

一个 [`CGRect`](../cg-rect.md)，数值是 0 到 1 的比例，见[画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)。直接写给 `rectOfInterest`。

实测：会话在取景、画面铺满 180 × 240 pt 的图层时，传整个图层的 `bounds`，得到的矩形在 0 到 1 之内。

结果取决于会话现在的画面，所以**在会话开始取景之后再算**（[`startRunning()`](../av-capture-session/startrunning.md) 兑现之后）。开始取景之前算出来的值**未在真机验证**。图层的 `frame` 或 `videoGravity` 变了之后，要重新算一次。

### 异常

**`TypeError`**

- `rect` 不是对象：`metadataOutputRectOfInterestForRect needs an object with all of: x, y, width, height`。
- 少了某个字段，或者某个字段不是有限数：`metadataOutputRectOfInterestForRect is missing …, or it is not a finite number`。

## 示例

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  const preview = new AVCaptureVideoPreviewLayer(session);
  preview.frame = new CGRect(0, 0, 300, 400);

  session.startRunning().then(() => {
    // 扫描框：图层正中 200 × 200 pt
    output.rectOfInterest = preview.metadataOutputRectOfInterestForRect(new CGRect(50, 100, 200, 200));
    console.log(String(output.rectOfInterest));
  });
}
```

**效果**：已经授权时，会话开始取景之后，控制台输出换算出来的矩形，四个数都在 0 到 1 之间。之后输出只认图层正中那块 200 × 200 pt 里的码（**未在真机验证**）。

## 对应的 iOS API

`-[AVCaptureVideoPreviewLayer metadataOutputRectOfInterestForRect:]`。

## 参见

- [`rectOfInterest`](../av-capture-metadata-output/rectofinterest.md)
- [只认框里的码](../../guides/scanning.md#只认框里的码)
