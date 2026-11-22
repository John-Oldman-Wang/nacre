---
type: reference
native: AVCaptureMetadataOutputDetectEvent.objects
---

# `AVCaptureMetadataOutputDetectEvent`：`objects` 属性

**`objects`** 属性是这一帧里认到的全部。

## 值

数组，至少一个元素。数组是冻结的，里面的对象也都只读。

- 只读。给它赋值抛 `TypeError`。
- 认到的是码时，元素是 [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md)，有 `stringValue`（码里的文字）和 `corners`（四个角）。读 `stringValue` 之前先用 `instanceof` 判断。
- 认到的是人脸这类时，元素是 [`AVMetadataObject`](../av-metadata-object.md)，只有 `type` 和 `bounds`。
- `bounds` 和 `corners` 是 0 到 1 的比例，见[画面里的坐标](../av-capture-metadata-output.md#画面里的坐标)。
- 用 [`new`](constructor.md) 创建时没给，是 冻结的空数组。

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

**效果**：取景画面里有码时，每一帧输出码的种类和里面的文字。

## 对应的 iOS API

`captureOutput:didOutputMetadataObjects:fromConnection:` 的参数 `metadataObjects`。

## 参见

- [`AVCaptureMetadataOutputDetectEvent`](../av-capture-metadata-output-detect-event.md)
