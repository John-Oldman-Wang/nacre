---
type: reference
native: "-[AVCaptureDevice unlockForConfiguration]"
---

# `AVCaptureDevice`：`unlockForConfiguration()` 方法

**`unlockForConfiguration()`** 方法交还 [`lockForConfiguration()`](lockforconfiguration.md) 拿到的改设置的权利。

## 语法

```
unlockForConfiguration()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 交还之后，已经写进去的设置保持不变：手电筒开着的还开着，变焦倍数不变。
- 交还之后再写手电筒、变焦、对焦这几个属性，抛 `DOMException`，`name` 是 `'InvalidStateError'`（实测）。要再改，再调一次 `lockForConfiguration()`。
- 没有锁着时调它会怎样，**未在真机验证**。

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

**效果**：控制台输出 `near`。交还之后设置还在。

## 对应的 iOS API

`-[AVCaptureDevice unlockForConfiguration]`。

## 参见

- [`lockForConfiguration()`](lockforconfiguration.md)：拿到改设置的权利
- [改设置之前先锁住](../av-capture-device.md#改设置之前先锁住)
