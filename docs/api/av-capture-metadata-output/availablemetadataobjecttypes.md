---
type: reference
native: AVCaptureMetadataOutput.availableMetadataObjectTypes
---

# `AVCaptureMetadataOutput`：`availableMetadataObjectTypes` 属性

**`availableMetadataObjectTypes`** 属性表示这个输出现在能识别哪些种类。[`metadataObjectTypes`](metadataobjecttypes.md) 只能从这里面选。

## 值

种类名的数组，每个名字是 [`metadataObjectTypes`](metadataobjecttypes.md#值) 那张表里的一个。

- 只读。给它赋值抛 `TypeError`。
- 每次读得到一个新数组，改这个数组不影响输出。
- **输出加进一个接好摄像头的会话之前，它是空数组**（实测）。
- 加进去之后，内容取决于接的摄像头。iPhone 14 的后置摄像头上实测包括 `'qrCode'`、`'ean13Code'`、`'ean8Code'`、`'code128Code'`、`'code39Code'`、`'code39Mod43Code'`、`'code93Code'`、`'pdf417Code'`、`'aztecCode'`、`'dataMatrixCode'`、`'interleaved2of5Code'`、`'itf14Code'`、`'upceCode'`、`'codabarCode'`、`'face'` 等。
- 它随会话的输入和输出变化，变化时不派发事件。要用的时候现读：在 [`addOutput()`](../av-capture-session/addoutput.md) 之后、写 `metadataObjectTypes` 之前读一次。

## 示例

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  console.log(output.availableMetadataObjectTypes.length);
  session.addOutput(output);
  console.log(output.availableMetadataObjectTypes.includes('qrCode'));
}
```

**效果**：已经授权时，控制台先输出 `0`，再输出 `true`。

## 对应的 iOS API

`AVCaptureMetadataOutput.availableMetadataObjectTypes`。常量 `AVMetadataObjectTypeQRCode` 写成 `'qrCode'`，其余同理。

## 参见

- [`metadataObjectTypes`](metadataobjecttypes.md)：选要识别的种类
- [`addOutput()`](../av-capture-session/addoutput.md)
