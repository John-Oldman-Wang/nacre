---
type: reference
native: "+[AVCaptureDeviceInput deviceInputWithDevice:error:]"
---

# `AVCaptureDeviceInput()` 构造函数

**`AVCaptureDeviceInput()`** 构造函数把一个摄像头包成会话的输入。建好之后用会话的 [`addInput()`](../av-capture-session/addinput.md) 加进去，会话才从这个摄像头取画面。

## 语法

```
new AVCaptureDeviceInput(device)
```

### 参数

**`device`**

要接的摄像头，一个 [`AVCaptureDevice`](../av-capture-device.md)。从 `AVCaptureDevice.defaultDeviceWithMediaType('video')` 或 `AVCaptureDevice.defaultDeviceWithDeviceType()` 拿到。

### 返回值

新建的 `AVCaptureDeviceInput`。它的 [`device`](device.md) 是传进去的那个摄像头。

### 异常

**`TypeError`**

- `device` 不是 `AVCaptureDevice`（`null`、字符串、别的原生对象）：`AVCaptureDeviceInput needs an AVCaptureDevice, got …`。
- 继承它：`class Mine extends AVCaptureDeviceInput {}` 在 `new Mine()` 时抛，信息以 `Illegal constructor` 开头。

**`Error`**

参数对，但系统打不开这个摄像头：`cannot open this camera: …`，后面是系统给的原因。实测用户拒绝过摄像头的授权时抛这个。摄像头被别的 App 占着时会不会抛**未在真机验证**。

## 说明

- 还没问过用户时（授权状态是 `'notDetermined'`），`new AVCaptureDeviceInput(device)` 这一下系统就弹出授权的提示框（实测）。推荐先用 [`AVCaptureDevice.requestAccessForMediaType()`](../av-capture-device/requestaccessformediatype.md) 申请，拿到结果再建输入，见[授权](../av-capture-device.md#授权)。
- 建输入要用到 `nacre.config.json` 里的 `NSCameraUsageDescription`，见[安装 `@nacrejs/av-capture`](../av-capture-session.md#先装上)。

## 示例

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const input = new AVCaptureDeviceInput(camera);
  const session = new AVCaptureSession();
  if (session.canAddInput(input)) session.addInput(input);
  console.log(session.inputs.length);
}
```

**效果**：已经授权时，控制台输出 `1`：会话接上了后置摄像头。没有授权时什么都不输出。

## 对应的 iOS API

`+[AVCaptureDeviceInput deviceInputWithDevice:error:]`。ObjC 里失败时返回 `nil` 并填 `error`；这里改成抛 `Error`。

## 参见

- [`device`](device.md)：接的是哪个摄像头
- [`addInput()`](../av-capture-session/addinput.md)：把输入加进会话
- [先申请授权](../../guides/scanning.md#先申请授权)
- [安装 `@nacrejs/av-capture`](../av-capture-session.md#先装上)
