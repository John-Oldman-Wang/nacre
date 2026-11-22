---
type: reference
web: BarcodeDetector.detect()
---

# `BarcodeDetector`：`detect()` 方法

**`detect()`** 方法在一张图片里找条码，兑现成找到的全部。

## 语法

```
detect(image)
```

### 参数

**`image`**

要找的图片，下面两种之一：

- 一个 [`UIImage`](../ui-image.md)：打包在 App 里的图、拍到的照片、从相册选的图。
- 一个 [`Blob`](../blob.md)，里面是一个图片文件的字节（PNG、JPEG 这类）。

图片的方向信息会被算进去：坐标对应的是摆正之后的图片。

### 返回值

`Promise`，兑现成找到的条码的数组。一个都没有时是空数组（实测）。

识别在后台进行，识别一张大图时界面不会卡住。几次 `detect()` 可以同时进行（实测同时识别三张，结果各自正确）。同一个检测器可以反复用。

数组的每一项是一个普通对象（类型名 `DetectedBarcode`），有四个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `rawValue` | 字符串 | 条码里的内容。内容不是文字时是空串 |
| `format` | 字符串 | 条码的格式，[`BarcodeDetector()`](constructor.md#参数) 那张表里的一个名字 |
| `boundingBox` | `{ x, y, width, height }` | 框住条码的矩形 |
| `cornerPoints` | `{ x, y }` 的数组 | 条码的四个角，按左上、右上、右下、左下的顺序（实测） |

坐标的单位是**图片的像素**，原点在图片左上角，`y` 向下增大：

- 实测：400 × 400 像素的图里，一个二维码画在 (128, 28) 起、200 像素见方的位置，`boundingBox` 是约 `(128, 28, 200, 200)`，四个角约是 (128, 28)、(328, 28)、(328, 228)、(128, 228)。
- 是像素，不是点（pt）。`UIImage` 的 `scale` 是 2 时，坐标是 `size` 的 2 倍，要除以 `scale` 才是点，见 [`size` 的单位是点，不是像素](../ui-image.md#size-的单位是点不是像素)。
- 同一张图用 `UIImage` 和用装着同一个文件的 `Blob` 识别，得到的框一样（实测）。

一张图里有几个码时，全部在数组里。实测一张 640 × 400 像素、两个二维码并排的图，认出两个，内容都对。数组里的先后顺序不是固定的，要按位置排就自己按 `boundingBox.x` 排。

**拒绝**：下面这些情况 Promise 被拒绝，不同步抛异常。

- `TypeError`：`image` 不是 `UIImage` 也不是 `Blob`（数、`null`、别的原生对象）：`detect needs a UIImage or a Blob, got …`（实测）。
- `TypeError`：`Blob` 里的字节解不出图片：`detect could not decode the Blob as an image`（实测）。
- `TypeError`：`UIImage` 背后没有位图：`detect needs a UIImage backed by a bitmap`。哪些 `UIImage` 会这样**未在真机验证**。
- `Error`：识别本身失败，信息是系统给的原因。什么情况下会发生**未在真机验证**。

### 异常

无。出错时都是返回的 Promise 被拒绝。

## 示例

### 认一张打包在 App 里的图

```js
async function scanBundledImage() {
  const image = UIImage.imageNamed('JS/assets/qr');
  if (image === null) return;
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  const codes = await detector.detect(image);
  for (const code of codes) {
    console.log(code.rawValue, code.boundingBox.x, code.boundingBox.y);
  }
}
scanBundledImage();
```

**效果**：项目的 `assets/qr.png` 里有一个二维码时，控制台输出一行：码里的内容，和码的左上角在图片里的像素坐标。图里没有二维码时什么都不输出。

### 认文件里的图

```js
async function scanFile() {
  const fs = application.fileSystem;
  const bytes = await fs.readBytes(fs.assets + '/qr.png');
  const detector = new BarcodeDetector();
  const codes = await detector.detect(new Blob([bytes], { type: 'image/png' }));
  console.log(codes.map((code) => code.format + ' ' + code.rawValue).join('\n'));
}
scanFile().catch((err) => console.log(err instanceof Error ? err.message : String(err)));
```

**效果**：输出图里每个码的格式和内容，一个码一行，比如 `qr_code https://example.com/a`。文件不是图片时输出 `detect could not decode the Blob as an image`。

## 和 Web 的差别

- `image` 只收 `UIImage` 和装着图片文件字节的 `Blob`。
- `boundingBox` 是只有 `x`、`y`、`width`、`height` 四个字段的普通对象。
- 结果里不会出现 `'unknown'` 格式。
- `'upc_a'` 能写进构造参数，但永远认不出来。

## 参见

- [`BarcodeDetector()`](constructor.md)：只找某几种格式
- [从一张图里认码](../../guides/scanning.md#从一张图里认码)：拍照或选图之后认码
- [`UIImage`](../ui-image.md)、[`Blob`](../blob.md)
