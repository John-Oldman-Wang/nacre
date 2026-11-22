---
type: reference
native: AVMetadataMachineReadableCodeObject.corners
---

# `AVMetadataMachineReadableCodeObject`：`corners` 属性

**`corners`** 属性表示码的四个角在画面里的位置。码斜着时，四个角连起来的四边形比 [`bounds`](../av-metadata-object/bounds.md) 贴得更紧。

## 值

[`CGPoint`](../cg-point.md) 的数组。对着二维码扫，实测是 4 个点。

- 坐标系和同一个对象的 `bounds` 一样：从 [`detect`](../av-capture-metadata-output/detect-event.md) 事件拿到的是 0 到 1 的比例；经过取景图层的 [`transformedMetadataObjectForMetadataObject()`](../av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) 换算之后是图层里的点（pt）。
- 只读。给它赋值抛 `TypeError`：`corners is read-only`。数组本身也是冻结的，不能增删元素。
- 值在对象生成时就定了，之后不变。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    if (found instanceof AVMetadataMachineReadableCodeObject) {
      console.log(found.corners.map((p) => p.x.toFixed(2) + ',' + p.y.toFixed(2)).join(' '));
    }
  }
});
```

**效果**：会话在取景、镜头前有二维码时，每个码每一帧输出一行，四个 0 到 1 之间的点。

## 对应的 iOS API

`AVMetadataMachineReadableCodeObject.corners`。ObjC 里每个角是一个字典，要用 `CGPointMakeWithDictionaryRepresentation` 转成点；这里直接是 `CGPoint`。

## 参见

- [`bounds`](../av-metadata-object/bounds.md)：框住码的矩形
- [把认到的码框出来](../../guides/scanning.md#把认到的码框出来)
