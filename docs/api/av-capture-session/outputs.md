---
type: reference
native: AVCaptureSession.outputs
---

# `AVCaptureSession`：`outputs` 属性

**`outputs`** 属性是会话现在的全部输出。

## 值

[`AVCaptureOutput`](../av-capture-output.md) 的数组。里面的元素实际是 [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md)。

- 只读。给它赋值抛 `TypeError`。
- 新建的会话是空数组。
- 用 [`addOutput()`](addoutput.md) 加进去的输出，读出来是同一个对象（实测）。
- 每次读得到一个新数组。改这个数组不影响会话，加减输出用 `addOutput()` 和 [`removeOutput()`](removeoutput.md)。
- 只有 App 自己加减输出时它才变，所以没有变化事件。

## 示例

```js
const session = new AVCaptureSession();
const output = new AVCaptureMetadataOutput();
session.addOutput(output);
console.log(session.outputs.length, session.outputs[0] === output);
```

**结果**：输出 `1 true`。

## 对应的 iOS API

`AVCaptureSession.outputs`。

## 参见

- [`inputs`](inputs.md)：全部输入
- [`addOutput()`](addoutput.md)、[`removeOutput()`](removeoutput.md)
