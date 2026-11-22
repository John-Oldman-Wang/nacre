---
type: reference
native: AVMetadataMachineReadableCodeObject.stringValue
---

# `AVMetadataMachineReadableCodeObject`：`stringValue` 属性

**`stringValue`** 属性表示码里的文字。

## 值

字符串或 `null`。

- 码里存的是文字时，是这段文字。比如二维码里存的网址 `https://example.com/a`，读出来就是这个字符串（实测）。
- 码里存的不是文字（任意的字节）时，是 `null`。
- 只读。给它赋值抛 `TypeError`：`stringValue is read-only`（实测）。
- 值在对象生成时就定了，之后不变。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  const first = e.objects[0];
  if (first instanceof AVMetadataMachineReadableCodeObject && first.stringValue !== null) {
    console.log('扫到 ' + first.stringValue);
  }
}, { once: true });
```

**效果**：会话在取景、镜头前有二维码时，输出一次 `扫到 ` 加上码里的文字，之后不再输出。

## 对应的 iOS API

`AVMetadataMachineReadableCodeObject.stringValue`。

## 参见

- [`corners`](corners.md)：码的四个角
- [`detect`](../av-capture-metadata-output/detect-event.md)
