---
type: reference
native: AVMetadataObject
status: partial
---

# `AVMetadataObject`

**`AVMetadataObject`** 表示 [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) 在一帧画面里认到的一样东西：它是什么（[`type`](av-metadata-object/type.md)），在画面里的哪里（[`bounds`](av-metadata-object/bounds.md)）。认到的是码时，得到的是它的子类 [`AVMetadataMachineReadableCodeObject`](av-metadata-machine-readable-code-object.md)，多了码里的内容和四个角。人脸、人体这类种类得到的就是 `AVMetadataObject`。

它是一个只读的值：字段在认到的那一刻定下，之后不变。给字段赋值抛 `TypeError`（实测）。它只从 [`detect`](av-capture-metadata-output/detect-event.md) 事件的 `objects` 里来，或者由取景图层的 [`transformedMetadataObjectForMetadataObject()`](av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) 换算出来。

它属于 `@nacrejs/av-capture` 这个包，安装见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：`AVMetadataObject` 不继承其他类（实测）。

## 构造函数

不能用 `new` 创建：`new AVMetadataObject()` 抛 `TypeError`，信息是 `Illegal constructor: AVMetadataObject comes from the detect event of AVCaptureMetadataOutput`（实测）。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`type`](av-metadata-object/type.md) <small>只读</small> | 认到的是什么，比如 `'qrCode'`、`'face'` |
| [`bounds`](av-metadata-object/bounds.md) <small>只读</small> | 在画面里的位置，一个 `CGRect` |

`bounds` 是 0 到 1 的比例还是图层里的点，看它从哪里来：从 `detect` 事件直接拿到的是比例，见[画面里的坐标](av-capture-metadata-output.md#画面里的坐标)；经过取景图层换算的是图层里的点。

## 实例方法

没有。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    const { x, y, width, height } = found.bounds;
    console.log(found.type, x.toFixed(2), y.toFixed(2), width.toFixed(2), height.toFixed(2));
  }
});
```

**效果**：这个输出加进一个在取景的会话、设好要认的种类之后，每认到一样东西输出一行：种类，和它在画面里的位置（0 到 1 的比例）。

## 对应的 iOS API

`AVMetadataObject`。`type` 是字符串，`AVMetadataObjectTypeFace` 写成 `'face'`，其余同理。`bounds` 是 [`CGRect`](cg-rect.md)。

## 参见

- [`AVMetadataMachineReadableCodeObject`](av-metadata-machine-readable-code-object.md)：认到的码
- [`detect`](av-capture-metadata-output/detect-event.md)：认到的东西从这里来
- [画面里的坐标](av-capture-metadata-output.md#画面里的坐标)
