---
type: reference
native: "-[AVCaptureSession addInput:]"
---

# `AVCaptureSession`：`addInput()` 方法

**`addInput()`** 方法把一个输入加进会话。输入是画面的来源，实际用的是接着一个摄像头的 [`AVCaptureDeviceInput`](../av-capture-device-input.md)。

## 语法

```
addInput(input)
```

### 参数

**`input`**

一个 [`AVCaptureInput`](../av-capture-input.md)。

### 返回值

无（`undefined`）。

加进去之后，[`inputs`](inputs.md) 里有它，读出来是同一个对象。会话拿着加进去的输入，App 不用自己留引用。

### 异常

**`TypeError`**

- `input` 不是 `AVCaptureInput`（比如传了一个输出、`null`、字符串）：`addInput needs an AVCaptureInput, got …`。
- 加不进去，也就是 [`canAddInput()`](canaddinput.md) 是 `false`：`addInput: this input cannot be added to the session (check canAddInput() first)`。同一个输入加第二次就是这种情况。抛了之后 `inputs` 不变。

## 说明

- 要先接摄像头，再加 [`AVCaptureMetadataOutput`](../av-capture-metadata-output.md)：元数据输出能识别哪些种类，要等它进了一个接着摄像头的会话之后才知道。
- 会话在取景时换输入，把去掉和加上放在 [`beginConfiguration()`](beginconfiguration.md) 和 [`commitConfiguration()`](commitconfiguration.md) 之间，两步一次生效。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  const input = new AVCaptureDeviceInput(camera);
  if (session.canAddInput(input)) {
    session.addInput(input);
  }
  console.log(session.inputs.length, session.inputs[0] === input);
}
```

**结果**：用户已经同意 App 使用摄像头时，输出 `1 true`。

## 对应的 iOS API

`-[AVCaptureSession addInput:]`。ObjC 里加不进去时系统抛 ObjC 的异常；这里抛 `TypeError`，可以用 `try` 接住。

## 参见

- [`canAddInput()`](canaddinput.md)：先问能不能加
- [`removeInput()`](removeinput.md)：去掉
- [`AVCaptureDeviceInput()`](../av-capture-device-input/constructor.md)：建一个接着摄像头的输入
