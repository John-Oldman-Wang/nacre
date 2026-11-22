---
type: reference
native: AVCaptureMetadataOutput.rectOfInterest
---

# `AVCaptureMetadataOutput`：`rectOfInterest` 属性

**`rectOfInterest`** 属性表示输出只在画面的哪一块里找。框外的码不派发 [`detect`](detect-event.md)。

## 值

一个 [`CGRect`](../cg-rect.md)，数值是 0 到 1 的比例，不是 pt。坐标怎么定，见[画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)。

- 可读，可写。读出来是 `CGRect`（实测）。写的时候可以给 `CGRect`，也可以给带 `x`、`y`、`width`、`height` 四个数的普通对象。
- 默认值是整个画面 `(0, 0, 1, 1)`（实测）。
- 写 `{ x: 0.1, y: 0.2, width: 0.5, height: 0.6 }`，读回来是同样的四个数（实测）。
- 写了之后只认框里的码，这个效果**未在真机验证**。
- 只有自己的代码会改它，所以没有变化通知。

不要自己算这四个数。屏幕上的扫描框是取景图层里的一个矩形，用取景图层的 [`metadataOutputRectOfInterestForRect()`](../av-capture-video-preview-layer/metadataoutputrectofinterestforrect.md) 换算，在会话开始取景之后再算。

### 写错时

**`TypeError`**

- 写的不是对象：`rectOfInterest needs an object with all of: x, y, width, height`（实测写数时抛）。
- 少了某个字段，或者某个字段不是有限数：`rectOfInterest is missing …, or it is not a finite number`。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.rectOfInterest = { x: 0.25, y: 0.25, width: 0.5, height: 0.5 };
const area = output.rectOfInterest;
console.log(area.x, area.y, area.width, area.height);
```

**效果**：控制台输出 `0.25 0.25 0.5 0.5`。输出只在画面正中占一半宽、一半高的那一块里找（**未在真机验证**）。

## 对应的 iOS API

`AVCaptureMetadataOutput.rectOfInterest`。

## 参见

- [`metadataOutputRectOfInterestForRect()`](../av-capture-video-preview-layer/metadataoutputrectofinterestforrect.md)：从图层的坐标换算
- [只认框里的码](../../guides/scanning.md#只认框里的码)
- [画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)
