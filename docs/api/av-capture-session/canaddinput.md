---
type: reference
native: "-[AVCaptureSession canAddInput:]"
---

# `AVCaptureSession`：`canAddInput()` 方法

**`canAddInput()`** 方法问一个输入现在能不能加进这个会话。它只问，不加。

## 语法

```
canAddInput(input)
```

### 参数

**`input`**

一个 [`AVCaptureInput`](../av-capture-input.md)，实际用的是 [`AVCaptureDeviceInput`](../av-capture-device-input.md)。

### 返回值

布尔值。`true` 表示调 [`addInput()`](addinput.md) 能加进去；`false` 表示加不进去，比如这个输入已经在会话里了（实测：同一个输入加过一次之后再问是 `false`）。

### 异常

**`TypeError`**

- `input` 不是 `AVCaptureInput`：`canAddInput needs an AVCaptureInput, got …`。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  const input = new AVCaptureDeviceInput(camera);
  console.log(session.canAddInput(input));
  session.addInput(input);
  console.log(session.canAddInput(input));
}
```

**结果**：用户已经同意 App 使用摄像头时，依次输出 `true`、`false`。还没问过用户时，`new AVCaptureDeviceInput()` 这一行会先弹出授权的提示框，见[授权](../av-capture-device.md#授权)。

## 对应的 iOS API

`-[AVCaptureSession canAddInput:]`。

## 参见

- [`addInput()`](addinput.md)：加进去
- [`inputs`](inputs.md)：现在有哪些输入
