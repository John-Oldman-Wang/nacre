---
type: reference
native: "-[AVCaptureVideoPreviewLayer transformedMetadataObjectForMetadataObject:]"
---

# `AVCaptureVideoPreviewLayer`：`transformedMetadataObjectForMetadataObject()` 方法

**`transformedMetadataObjectForMetadataObject()`** 方法把 [`detect`](../av-capture-metadata-output/detect-event.md) 事件里认到的一个对象换算到这个图层上：换算出来的对象的位置是图层里的点，可以直接拿来在图层上画框。

## 语法

```
transformedMetadataObjectForMetadataObject(metadataObject)
```

### 参数

**`metadataObject`**

从 `detect` 事件的 `objects` 里拿到的一个对象（[`AVMetadataObject`](../av-metadata-object.md) 或 [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md)）。

### 返回值

一个新的对象，类和参数一样：参数是码对象，得到的也是码对象（实测）。它的 `type` 和 `stringValue` 和参数一样；`bounds` 和 `corners` 换成了这个图层里的点（pt），原点在图层左上角，已经算进了 [`videoGravity`](videogravity.md) 的缩放和裁剪。

换算不了时是 `null`。

参数本身不变。

### 异常

**`TypeError`**

参数不是从 `detect` 事件拿到的（自己建的对象、普通对象）：`transformedMetadataObjectForMetadataObject needs an object from a detect event, got …`（实测）。

## 说明

- 在 `detect` 的监听器里当场换算。之后图层的 `frame` 或 `videoGravity` 变了，原来换算出来的位置就对不上了。
- 换算出来的位置是这个图层里的点。图层铺满某个视图时，它也是那个视图里的点，可以直接设成叠在上面的视图的 `frame`。

## 示例

```js
const session = new AVCaptureSession();
const preview = new AVCaptureVideoPreviewLayer(session);
preview.frame = new CGRect(0, 0, 300, 400);
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    const onLayer = preview.transformedMetadataObjectForMetadataObject(found);
    if (onLayer !== null) {
      const box = onLayer.bounds;
      console.log(Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height));
    }
  }
});
```

**效果**：`session` 接上摄像头、加上 `output`、开始取景之后，镜头前有码时，每个码每一帧输出一行：它在 300 × 400 pt 的图层里的位置和大小，单位 pt。

## 对应的 iOS API

`-[AVCaptureVideoPreviewLayer transformedMetadataObjectForMetadataObject:]`。

## 参见

- [把认到的码框出来](../../guides/scanning.md#把认到的码框出来)
- [`bounds`](../av-metadata-object/bounds.md)、[`corners`](../av-metadata-machine-readable-code-object/corners.md)
