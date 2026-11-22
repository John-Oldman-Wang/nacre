---
type: reference
native: AVCaptureDeviceInput
status: partial
---

# `AVCaptureDeviceInput`

**`AVCaptureDeviceInput`** 表示把一个摄像头接进 [`AVCaptureSession`](av-capture-session.md) 的输入。用一个 [`AVCaptureDevice`](av-capture-device.md) 建出来，用会话的 [`addInput()`](av-capture-session/addinput.md) 加进去之后，会话从这个摄像头取画面。

建它的那一刻要用到摄像头：还没问过用户时，系统在这一刻弹出授权的提示框；用户没有授权时建不出来。见 [`AVCaptureDevice`](av-capture-device.md#授权)。

它属于 `@nacrejs/av-capture` 这个包，安装见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → [`AVCaptureInput`](av-capture-input.md) → `AVCaptureDeviceInput`

## 构造函数

[`AVCaptureDeviceInput()`](av-capture-device-input/constructor.md)

把一个摄像头包成会话的输入。没有授权时抛 [`NSError`](ns-error.md)。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`device`](av-capture-device-input/device.md) <small>只读</small> | 接的是哪个摄像头 |

## 实例方法

没有自己的方法。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  try {
    const input = new AVCaptureDeviceInput(camera);
    if (session.canAddInput(input)) session.addInput(input);
    console.log('接上了 ' + input.device.localizedName);
  } catch (err) {
    console.log('接不上摄像头：' + (err instanceof Error ? err.message : String(err)));
  }
}
```

**效果**

- 用户已经同意时，控制台输出 `接上了 Back Camera`（iPhone 14 上的名字）。
- 还没问过用户时，`new AVCaptureDeviceInput(camera)` 这一下弹出授权的提示框。
- 用户拒绝过时，控制台输出 `接不上摄像头：` 和系统给的原因。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[AVCaptureDeviceInput deviceInputWithDevice:device error:&error]`，失败时返回 `nil` | `new AVCaptureDeviceInput(device)`，失败时抛 `NSError`，`domain` 是空串、`code` 是 0，系统给的原因在 `message` 里 |
| `input.device` | `input.device` |

## 参见

- [`AVCaptureDevice`](av-capture-device.md)：找摄像头，授权
- [`AVCaptureSession`](av-capture-session.md)：把输入加进会话
- [扫码](../guides/scanning.md)
