---
type: reference
native: AVCaptureDevice.torchMode
---

# `AVCaptureDevice`：`torchMode` 属性

**`torchMode`** 属性控制摄像头旁边的手电筒：关、开，或者按环境光自动开关。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'off'` | 关着 |
| `'on'` | 一直亮着 |
| `'auto'` | 环境暗时自动亮，亮时自动关 |

- 可读，可写。
- 默认值是 `'off'`（实测）。
- 写之前要先调 [`lockForConfiguration()`](lockforconfiguration.md)，写完调 [`unlockForConfiguration()`](unlockforconfiguration.md)。
- 写 `'on'` 和 `'auto'` 之后手电筒真的亮起来，**未在真机验证**。
- 它由 App 自己写，变的时候没有事件。

### 写错时

- 没锁就写：抛 [`DOMException`](../dom-exception.md)，`name` 是 `'InvalidStateError'`，值不变（实测）。信息是 `torchMode: the system refused (…)`，括号里是系统给的原因，说的是要先锁（`-lockForConfiguration:`）。
- 摄像头没有手电筒（[`hasTorch`](hastorch.md) 是 `false`）或者不支持这个取值：系统拒绝，抛 `DOMException`，`name` 是 `'InvalidStateError'`，信息里带系统给的原因。**未在真机验证。**
- 写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，`torchMode` 保持原来的值（实测）。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.hasTorch) {
  device.lockForConfiguration();
  try {
    device.torchMode = device.torchMode === 'on' ? 'off' : 'on';
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.torchMode);
}
```

**效果**：手电筒关着时打开，开着时关上，控制台输出切换之后的值。手电筒亮灭**未在真机验证**。

## 对应的 iOS API

`AVCaptureDevice.torchMode`。`AVCaptureTorchModeOn` 写成 `'on'`，其余同理。ObjC 里没锁就写抛 `NSGenericException`，这里抛 `DOMException`，`name` 是 `'InvalidStateError'`。

## 参见

- [`hasTorch`](hastorch.md)、[`isTorchAvailable`](istorchavailable.md)：有没有、现在能不能用
- [改设置之前先锁住](../av-capture-device.md#改设置之前先锁住)
- [打开手电筒](../../guides/scanning.md#打开手电筒)
