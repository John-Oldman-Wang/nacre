---
type: reference
native: "-[AVCaptureSession addOutput:]"
---

# `AVCaptureSession`：`addOutput()` 方法

**`addOutput()`** 方法把一个输出加进会话。输出处理会话里的画面，实际用的是识别码的 [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md)。

## 语法

```
addOutput(output)
```

### 参数

**`output`**

一个 [`AVCaptureOutput`](../av-capture-output.md)。

### 返回值

无（`undefined`）。

加进去之后，[`outputs`](outputs.md) 里有它，读出来是同一个对象。会话拿着加进去的输出，App 不用自己留引用。

### 异常

**`TypeError`**

- `output` 不是 `AVCaptureOutput`（比如 `null`）：`addOutput needs an AVCaptureOutput, got …`。
- 加不进去，也就是 [`canAddOutput()`](canaddoutput.md) 是 `false`：`addOutput: this output cannot be added to the session (check canAddOutput() first)`。同一个输出加第二次就是这种情况。抛了之后 `outputs` 不变（实测）。

## 说明

元数据输出要先进一个接着摄像头的会话，才知道能识别哪些种类。所以顺序是：先 [`addInput()`](addinput.md) 接摄像头，再 `addOutput()`，最后写输出的 [`metadataObjectTypes`](../av-capture-metadata-output/metadataobjecttypes.md)。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode'];
  console.log(session.outputs.length, output.metadataObjectTypes.join(','));
}
```

**结果**：用户已经同意 App 使用摄像头时，输出 `1 qrCode`。

## 对应的 iOS API

`-[AVCaptureSession addOutput:]`。ObjC 里加不进去时系统抛 ObjC 的异常；这里抛 `TypeError`，可以用 `try` 接住。

## 参见

- [`canAddOutput()`](canaddoutput.md)：先问能不能加
- [`removeOutput()`](removeoutput.md)：去掉
- [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md)：识别码
