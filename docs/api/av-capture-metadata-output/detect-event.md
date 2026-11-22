---
type: reference
native: "-[AVCaptureMetadataOutputObjectsDelegate captureOutput:didOutputMetadataObjects:fromConnection:]"
---

# `AVCaptureMetadataOutput`：`detect` 事件

**`detect`** 事件在输出从画面里认到了要找的东西时派发。事件带着这一帧里认到的全部。

## 语法

```
output.addEventListener('detect', (event) => { })
```

## 事件对象

`AVCaptureMetadataOutputDetectEvent`，多出一个字段：

**`objects`**

这一帧里认到的全部，一个数组，至少一个。数组和里面的对象都只读。

- 认到的是码时，元素是 [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md)，有 `stringValue`（码里的文字）和 `corners`（四个角）。
- 认到的是人脸这类时，元素是 [`AVMetadataObject`](../av-metadata-object.md)，只有 `type` 和 `bounds`。
- 数组的元素类型写的是 `AVMetadataObject`。读 `stringValue` 之前先用 `instanceof AVMetadataMachineReadableCodeObject` 判断，见示例。
- `bounds` 和 `corners` 是 0 到 1 的比例，见[画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)。要画在屏幕上，用取景图层的 [`transformedMetadataObjectForMetadataObject()`](../av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) 换算成图层里的点。

对着屏幕上同时有两个二维码的图扫，实测一帧里认到 2 个，两个的内容都对。

事件不能取消。`target` 是这个输出。

## 什么时候派发

下面几件事同时成立时，画面里每有一帧认到了要找的东西，就派发一次：

- 有 `detect` 的监听器。
- [`metadataObjectTypes`](metadataobjecttypes.md) 不是空数组。
- 输出加在一个正在取景的会话上（[`startRunning()`](../av-capture-session/startrunning.md) 之后）。
- 画面里有要找的种类，并且在 [`rectOfInterest`](rectofinterest.md) 里面。

码一直在镜头前，事件就一帧接一帧地来，同一个码会被报很多次。只要一次的话，加监听器时带 `{ once: true }`，并且认到之后停止取景，见[扫到就停](../../guides/scanning.md#扫到就停)。

回调在系统报告之后的下一轮执行。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    if (found instanceof AVMetadataMachineReadableCodeObject) {
      console.log(found.type, found.stringValue);
    }
  }
});
```

**效果**：会话在取景、镜头前有二维码时，每一帧输出一行，比如 `qrCode https://example.com/a`。画面里有两个码时，同一帧输出两行。

## 对应的 iOS API

委托方法 `captureOutput:didOutputMetadataObjects:fromConnection:`。`metadataObjects` 参数是 `e.objects`。不用设委托，也不用指定队列，用 `addEventListener`。

## 参见

- [`metadataObjectTypes`](metadataobjecttypes.md)：要找什么
- [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md)：认到的码
- [一帧里有好几个码](../../guides/scanning.md#一帧里有好几个码)
- [把认到的码框出来](../../guides/scanning.md#把认到的码框出来)
