---
type: reference
web: BarcodeDetector
---

# `BarcodeDetector`

**`BarcodeDetector`** 表示在一张图片里找条码的检测器。条码包括二维码（QR 码）、商品条码等十几种格式。给它一张 [`UIImage`](ui-image.md)，或者一个装着图片文件字节的 [`Blob`](blob.md)，它找出图里的全部条码：每个码里的内容、格式，以及在图片里的位置。

它在核心里，不用装包，也不用摄像头的授权。图片可以来自任何地方：打包在 App 里的图、拍到的照片、从相册选的图、网上下载的图。识别在后台进行，识别大图时界面不会卡住。

要从摄像头的实时画面里认码，用 `@nacrejs/av-capture` 这个包里的 [`AVCaptureMetadataOutput`](av-capture-metadata-output.md)。

**继承关系**：`BarcodeDetector` 不继承其他类（实测）。

## 构造函数

[`BarcodeDetector()`](barcode-detector/constructor.md)

创建一个检测器。可以指定只找哪几种格式，不指定时找这台设备认得的全部。

## 静态方法

[`BarcodeDetector.getSupportedFormats()`](barcode-detector/getsupportedformats.md)

这台设备认得哪几种格式，兑现成格式名的数组。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`detect()`](barcode-detector/detect.md) | 在一张图片里找条码，兑现成找到的全部 |

## 示例

### 认一张打包在 App 里的图

从空白 App 开始。项目的 `assets/` 里放一张有二维码的图 `qr.png`。

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const image = UIImage.imageNamed('JS/assets/qr');
  if (image === null) {
    console.log('找不到图片');
    return;
  }
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  const codes = await detector.detect(image);
  console.log('找到 ' + codes.length + ' 个');
  for (const code of codes) {
    const box = code.boundingBox;
    console.log(code.rawValue + ' 在 (' + box.x + ', ' + box.y + ')，' + box.width + ' × ' + box.height + ' 像素');
  }
}
main();
```

**结果**

- 图里有一个二维码时，输出 `找到 1 个`，下一行是码里的内容和码在图片里的位置。实测一张 400 × 400 像素的图，码里是 `https://example.com/a`，框在约 (128, 28)、200 × 200 像素。
- 图里没有二维码时，输出 `找到 0 个`。

`UIImage.imageNamed()` 的路径写法见[随 App 打包的图片放在哪](ui-image.md#随-app-打包的图片放在哪)。

## 和 Web 的差别

- `detect()` 的参数是 `UIImage` 或者装着图片文件字节的 `Blob`。
- `getSupportedFormats()` 在 iPhone 14 上实测有 12 种，没有 `'upc_a'`。`'upc_a'` 可以写进构造参数，但认不出来。
- 结果里的 `boundingBox` 是只有 `x`、`y`、`width`、`height` 四个字段的普通对象。
- 结果里的 `format` 不会是 `'unknown'`。

## 参见

- [`detect()`](barcode-detector/detect.md)：结果的每个字段
- [扫码](../guides/scanning.md#从一张图里认码)：从拍到的照片、选的图里认码
- [`UIImage`](ui-image.md)、[`Blob`](blob.md)：图片从哪里来
- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md)：从摄像头的实时画面里认码
