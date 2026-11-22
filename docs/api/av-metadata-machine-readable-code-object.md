---
type: reference
native: AVMetadataMachineReadableCodeObject
status: partial
---

# `AVMetadataMachineReadableCodeObject`

**`AVMetadataMachineReadableCodeObject`** 表示在取景画面里认到的一个码：二维码、商品条码这类。除了继承来的种类和位置，它还带着码里的文字（[`stringValue`](av-metadata-machine-readable-code-object/stringvalue.md)）和码的四个角（[`corners`](av-metadata-machine-readable-code-object/corners.md)）。

它从 [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) 的 [`detect`](av-capture-metadata-output/detect-event.md) 事件里来。事件的 `objects` 的元素类型写的是父类 `AVMetadataObject`，读码的字段之前先用 `instanceof AVMetadataMachineReadableCodeObject` 判断。

和父类一样，它是一个只读的值。给字段赋值抛 `TypeError`，信息是 `stringValue is read-only` 这样的一句（实测）。

它属于 `@nacrejs/av-capture` 这个包，安装见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：[`AVMetadataObject`](av-metadata-object.md) → `AVMetadataMachineReadableCodeObject`

## 构造函数

不能用 `new` 创建，抛 `TypeError`，信息是 `Illegal constructor: AVMetadataObject comes from the detect event of AVCaptureMetadataOutput`（实测）。

## 实例属性

还继承 [`AVMetadataObject`](av-metadata-object.md) 的 [`type`](av-metadata-object/type.md) 和 [`bounds`](av-metadata-object/bounds.md)。

| 属性 | 说明 |
| --- | --- |
| [`stringValue`](av-metadata-machine-readable-code-object/stringvalue.md) <small>只读</small> | 码里的文字。内容不是文字时是 `null` |
| [`corners`](av-metadata-machine-readable-code-object/corners.md) <small>只读</small> | 码的四个角，`CGPoint` 的数组 |

## 实例方法

没有。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    if (found instanceof AVMetadataMachineReadableCodeObject && found.stringValue !== null) {
      console.log(found.type + ' ' + found.stringValue + '，' + found.corners.length + ' 个角');
    }
  }
});
```

**效果**：对着二维码扫时，每一帧输出一行，比如 `qrCode https://example.com/a，4 个角`。实测认到的二维码 `type` 是 `'qrCode'`，`corners` 有 4 个点。

## 对应的 iOS API

`AVMetadataMachineReadableCodeObject`。`stringValue` 一样；`corners` 在 ObjC 里是一组字典，这里是 [`CGPoint`](cg-point.md) 的数组。

## 参见

- [`AVMetadataObject`](av-metadata-object.md)：父类，`type` 和 `bounds`
- [`detect`](av-capture-metadata-output/detect-event.md)
- [把认到的码框出来](../guides/scanning.md#把认到的码框出来)
