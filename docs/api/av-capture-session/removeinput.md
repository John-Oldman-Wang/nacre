---
type: reference
native: "-[AVCaptureSession removeInput:]"
---

# `AVCaptureSession`：`removeInput()` 方法

**`removeInput()`** 方法把一个输入从会话里去掉。

## 语法

```
removeInput(input)
```

### 参数

**`input`**

一个 [`AVCaptureInput`](../av-capture-input.md)，通常是之前用 [`addInput()`](addinput.md) 加进去的那个。传一个不在这个会话里的输入会怎样，**未在真机验证**。

### 返回值

无（`undefined`）。去掉之后 [`inputs`](inputs.md) 里不再有它（实测）。

### 异常

**`TypeError`**

- `input` 不是 `AVCaptureInput`：`removeInput needs an AVCaptureInput, got …`。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  const input = new AVCaptureDeviceInput(camera);
  session.addInput(input);
  session.removeInput(input);
  console.log(session.inputs.length);
}
```

**结果**：用户已经同意 App 使用摄像头时，输出 `0`。

## 对应的 iOS API

`-[AVCaptureSession removeInput:]`。

## 参见

- [`addInput()`](addinput.md)：加进去
- [`beginConfiguration()`](beginconfiguration.md)：把去掉和加上合成一次改动
