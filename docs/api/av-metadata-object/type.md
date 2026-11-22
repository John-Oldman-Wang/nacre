---
type: reference
native: AVMetadataObject.type
---

# `AVMetadataObject`：`type` 属性

**`type`** 属性表示认到的是什么：哪一种码，或者人脸这类东西。

## 值

字符串，[`metadataObjectTypes`](../av-capture-metadata-output/metadataobjecttypes.md#值) 那张表里的一个名字，比如 `'qrCode'`、`'ean13Code'`、`'face'`。

- 只读。给它赋值抛 `TypeError`：`type is read-only`。
- 值在对象生成时就定了，之后不变，没有变化通知。
- 它一定是输出的 `metadataObjectTypes` 里写了的一种。
- 对着二维码扫，实测是 `'qrCode'`。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  console.log(e.objects.map((found) => found.type).join(', '));
});
```

**效果**：会话在取景、镜头前有二维码时，每一帧输出一行 `qrCode`。画面里有两个二维码时输出 `qrCode, qrCode`。

## 对应的 iOS API

`AVMetadataObject.type`。`AVMetadataObjectTypeQRCode` 写成 `'qrCode'`，其余同理。

## 参见

- [`bounds`](bounds.md)：认到的东西在画面里的位置
- [`detect`](../av-capture-metadata-output/detect-event.md)
