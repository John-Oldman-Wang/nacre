---
type: reference
native: "-[AVCaptureDevice lockForConfiguration:]"
---

# `AVCaptureDevice`：`lockForConfiguration()` 方法

**`lockForConfiguration()`** 方法拿到改这个摄像头设置的权利。拿到之后才能写手电筒、变焦、对焦这几个属性。

## 语法

```
lockForConfiguration()
```

### 参数

无。

### 返回值

无（`undefined`）。返回了就是拿到了。

### 异常

**[`NSError`](../ns-error.md)**

系统不给：`lockForConfiguration failed: …`，后面是系统给的原因。`name` 是 `'NSError'`，`domain` 和 `code` 是系统给的原值。摄像头被别的 App 占着一类情况下会这样。什么情况下会拿不到**未在真机验证**。

## 说明

- 拿到之后，下面这几个属性才能写：[`torchMode`](torchmode.md)、[`videoZoomFactor`](videozoomfactor.md)、[`focusMode`](focusmode.md)、[`focusPointOfInterest`](focuspointofinterest.md)、[`autoFocusRangeRestriction`](autofocusrangerestriction.md)。没拿到就写，抛 `DOMException`，`name` 是 `'InvalidStateError'`（实测）。
- 改完调 [`unlockForConfiguration()`](unlockforconfiguration.md) 交还。交还之后再写又抛同样的 `DOMException`（实测）。
- 推荐改完马上交还：把写属性的代码放进 `try`，在 `finally` 里交还，中途抛了也不会忘。
- 不用先申请摄像头授权就能调（实测）。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.videoZoomFactor = 1;
    device.focusMode = 'continuousAutoFocus';
  } finally {
    device.unlockForConfiguration();
  }
}
```

**效果**：变焦回到 1 倍，对焦改成一直自动对焦，然后交还改设置的权利。

## 对应的 iOS API

`-[AVCaptureDevice lockForConfiguration:]`。ObjC 里拿不到时返回 `NO`、错误放在出参里；这里抛 `NSError`：`domain`、`code` 是出参那个错误的原值，它的说明在 `message` 里。

## 参见

- [`unlockForConfiguration()`](unlockforconfiguration.md)：交还
- [改设置之前先锁住](../av-capture-device.md#改设置之前先锁住)
