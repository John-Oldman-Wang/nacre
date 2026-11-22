---
type: reference
native: AVMetadataObject.bounds
---

# `AVMetadataObject`：`bounds` 属性

**`bounds`** 属性表示认到的东西在画面里的位置：框住它的矩形。

## 值

一个 [`CGRect`](../cg-rect.md)（实测）。数值的含义看对象从哪里来：

| 对象从哪里来 | 数值是什么 |
| --- | --- |
| [`detect`](../av-capture-metadata-output/detect-event.md) 事件的 `objects` | 0 到 1 的比例，见[画面里的坐标](../av-capture-metadata-output.md#画面里的坐标) |
| 取景图层的 [`transformedMetadataObjectForMetadataObject()`](../av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) 换算出来的 | 这个图层里的点（pt），原点在图层左上角 |

- 只读。给它赋值抛 `TypeError`：`bounds is read-only`。`CGRect` 的字段也是只读的。
- 值在对象生成时就定了，之后不变。码动了，下一帧的 `detect` 带来新的对象。

要把框画在屏幕上，先换算到图层，再用换算后的 `bounds`。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  const first = e.objects[0];
  if (first !== undefined) {
    const box = first.bounds;
    console.log(box.x.toFixed(2), box.y.toFixed(2), box.width.toFixed(2), box.height.toFixed(2));
  }
});
```

**效果**：会话在取景、镜头前有码时，每一帧输出第一个码的位置，四个 0 到 1 之间的数。

## 对应的 iOS API

`AVMetadataObject.bounds`。

## 参见

- [`transformedMetadataObjectForMetadataObject()`](../av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md)：换算成图层里的点
- [`corners`](../av-metadata-machine-readable-code-object/corners.md)：码的四个角
- [把认到的码框出来](../../guides/scanning.md#把认到的码框出来)
