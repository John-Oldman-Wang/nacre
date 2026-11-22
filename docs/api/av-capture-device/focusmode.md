---
type: reference
native: AVCaptureDevice.focusMode
---

# `AVCaptureDevice`：`focusMode` 属性

**`focusMode`** 属性表示摄像头怎么对焦。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'continuousAutoFocus'` | 一直自动对焦：画面里的东西远近变了，摄像头跟着重新对焦 |
| `'autoFocus'` | 对一次焦，然后锁住 |
| `'locked'` | 焦点锁住不动 |

- 可读，可写。
- 默认值：iPhone 14 的后置摄像头上实测是 `'continuousAutoFocus'`。扫码用它就好，不用改。
- 写之前要先调 [`lockForConfiguration()`](lockforconfiguration.md)，写完调 [`unlockForConfiguration()`](unlockforconfiguration.md)。
- 一个摄像头支持哪几种，用 [`isFocusModeSupported()`](isfocusmodesupported.md) 问。
- 写了之后读回来是写入的值（实测）。对焦在画面上的效果**未在真机验证**。
- 改了 [`focusPointOfInterest`](focuspointofinterest.md) 之后，再写一次 `focusMode`，新的对焦点才生效。这一条**未在真机验证**。
- `'autoFocus'` 对完焦之后读到的值是不是变成 `'locked'`，**未在真机验证**。
- 变的时候没有事件。

### 写错时

- 没锁就写：抛 `TypeError`，值不变（实测）。信息是 `focusMode: the system refused (…)`，括号里是系统给的原因，说的是要先锁（`-lockForConfiguration:`）。
- 摄像头不支持这种方式：系统拒绝，抛 `TypeError`，信息里带系统给的原因。**未在真机验证。**
- 写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，`focusMode` 保持原来的值（实测）。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.isFocusModeSupported('locked')) {
  device.lockForConfiguration();
  try {
    device.focusMode = 'locked';
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.focusMode);
}
```

**效果**：焦点锁住，控制台输出 `locked`。

## 对应的 iOS API

`AVCaptureDevice.focusMode`。`AVCaptureFocusModeContinuousAutoFocus` 写成 `'continuousAutoFocus'`，其余同理。ObjC 里没锁就写抛 `NSGenericException`，这里是 `TypeError`。

## 参见

- [`isFocusModeSupported()`](isfocusmodesupported.md)：支不支持某种方式
- [`focusPointOfInterest`](focuspointofinterest.md)：对焦点
- [`autoFocusRangeRestriction`](autofocusrangerestriction.md)：自动对焦只在哪个距离找
