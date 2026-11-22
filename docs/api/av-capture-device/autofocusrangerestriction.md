---
type: reference
native: AVCaptureDevice.autoFocusRangeRestriction
---

# `AVCaptureDevice`：`autoFocusRangeRestriction` 属性

**`autoFocusRangeRestriction`** 属性表示自动对焦只在哪个距离范围里找焦点。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 不限，远近都找 |
| `'near'` | 只在近处找。扫手边的码时对焦更快 |
| `'far'` | 只在远处找 |

- 可读，可写。
- 默认值是 `'none'`（实测）。
- 写之前要先调 [`lockForConfiguration()`](lockforconfiguration.md)，写完调 [`unlockForConfiguration()`](unlockforconfiguration.md)。
- 写了之后读回来是写入的值（实测）。对焦快了多少**未在真机验证**。
- 它由 App 自己写，变的时候没有事件。

### 写错时

- 没锁就写：抛 [`DOMException`](../dom-exception.md)，`name` 是 `'InvalidStateError'`，值不变（实测）。信息是 `autoFocusRangeRestriction: the system refused (…)`，括号里是系统给的原因，说的是要先锁（`-lockForConfiguration:`）。
- 摄像头不支持限定范围：系统拒绝，抛 `DOMException`，`name` 是 `'InvalidStateError'`，信息里带系统给的原因。**未在真机验证。** iPhone 14 的后置摄像头支持（实测）。
- 写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，值保持不变（实测）。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.autoFocusRangeRestriction = 'near';
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.autoFocusRangeRestriction);
}
```

**效果**：控制台输出 `near`。之后自动对焦只在近处找。

## 对应的 iOS API

`AVCaptureDevice.autoFocusRangeRestriction`。`AVCaptureAutoFocusRangeRestrictionNear` 写成 `'near'`，其余同理。ObjC 里写之前要先问 `autoFocusRangeRestrictionSupported`；这里摄像头不支持时写入抛 `DOMException`，`name` 是 `'InvalidStateError'`。

## 参见

- [`focusMode`](focusmode.md)：对焦方式
- [近处的码对焦更快](../../guides/scanning.md#近处的码对焦更快)
