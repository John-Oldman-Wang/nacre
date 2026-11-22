---
type: reference
native: AVCaptureMetadataOutput.metadataObjectTypes
---

# `AVCaptureMetadataOutput`：`metadataObjectTypes` 属性

**`metadataObjectTypes`** 属性表示这个输出要在画面里找哪些种类。画面里出现了这些种类之一，输出派发 [`detect`](detect-event.md)。

## 值

种类名的数组。可以写的名字：

| 取值 | 认的是什么 |
| --- | --- |
| `'qrCode'` | 二维码（QR 码） |
| `'microQRCode'` | Micro QR 码：只有一个定位角的小二维码 |
| `'aztecCode'` | Aztec 码：中心是一个回字形定位图案的二维码 |
| `'dataMatrixCode'` | Data Matrix 码 |
| `'pdf417Code'` | PDF417 码：由很多行条码叠起来的长方形码 |
| `'microPDF417Code'` | Micro PDF417 码 |
| `'code128Code'` | Code 128 条码 |
| `'code39Code'` | Code 39 条码 |
| `'code39Mod43Code'` | 带 mod 43 校验位的 Code 39 条码 |
| `'code93Code'` | Code 93 条码 |
| `'codabarCode'` | Codabar 条码 |
| `'ean13Code'` | EAN-13 商品条码（13 位数字） |
| `'ean8Code'` | EAN-8 商品条码（8 位数字） |
| `'upceCode'` | UPC-E 商品条码 |
| `'interleaved2of5Code'` | 交叉 25 码 |
| `'itf14Code'` | ITF-14 物流条码 |
| `'gs1DataBarCode'`、`'gs1DataBarExpandedCode'`、`'gs1DataBarLimitedCode'` | GS1 DataBar 一组条码 |
| `'face'` | 人脸 |
| `'humanBody'`、`'humanFullBody'` | 人的身体、人的全身 |
| `'catHead'`、`'catBody'`、`'dogHead'`、`'dogBody'` | 猫的头和身体、狗的头和身体 |
| `'salientObject'` | 画面里最显眼的东西 |
| `'focusTrackedObject'`、`'cinematicVideoMetadata'` | iOS 27 起才有 |

- 可读，可写。
- 默认值是空数组：什么都不识别（实测）。
- 只能写 [`availableMetadataObjectTypes`](availablemetadataobjecttypes.md) 里有的名字。输出加进接好摄像头的会话之前，那里是空的，这时写任何名字都抛 `TypeError`（实测）。
- 写入的数组被复制一份。之后改原来的数组不影响输出，读出来每次是一个新数组。
- 写 `['qrCode', 'ean13Code']`，读回来是 `['qrCode', 'ean13Code']`（实测）。
- 认到码时得到 [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md)，认到别的种类时得到 [`AVMetadataObject`](../av-metadata-object.md)。码以外的种类的识别效果**未在真机验证**。
- 只有自己的代码会改它，所以没有变化通知。

只写真正要找的种类。种类越少，认得越快、误认越少；扫二维码就只写 `['qrCode']`。

### 写错时

**`TypeError`**

- 写的名字认识，但现在识别不了（输出还没加进有摄像头的会话，或者这个摄像头认不了这一种）：`metadataObjectTypes "…" is not available now; read availableMetadataObjectTypes first (it is empty until the output is added to a session that has a camera input)`。值保持不变（实测）。
- 写的不是数组：`metadataObjectTypes must be an array of type names, got …`。

**警告**

数组里有一个不认识的名字：不抛异常，控制台输出一条警告，列出全部可用的值。整次赋值不生效，值保持原来的（实测）。

## 示例

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode', 'ean13Code'];
  console.log(output.metadataObjectTypes.join(','));
}
```

**效果**：已经授权时，控制台输出 `qrCode,ean13Code`。会话开始取景之后，这个输出找二维码和 EAN-13 商品条码。

## 对应的 iOS API

`AVCaptureMetadataOutput.metadataObjectTypes`。`AVMetadataObjectTypeQRCode` 写成 `'qrCode'`，`AVMetadataObjectTypeEAN13Code` 写成 `'ean13Code'`，其余同理。ObjC 里写了识别不了的种类，系统抛 `NSInvalidArgumentException`；这里抛 `TypeError`。

## 参见

- [`availableMetadataObjectTypes`](availablemetadataobjecttypes.md)：现在能选哪些
- [`detect`](detect-event.md)：认到了
- [`rectOfInterest`](rectofinterest.md)：只在画面的一块里找
