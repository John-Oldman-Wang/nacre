---
type: reference
native: "-[AVCaptureDevice rampToVideoZoomFactor:withRate:]"
---

# `AVCaptureDevice`：`rampToVideoZoomFactor()` 方法

**`rampToVideoZoomFactor()`** 方法让画面以一个速度平滑地变焦到指定的倍数，而不是一下子跳过去。

## 语法

```
rampToVideoZoomFactor(factor, { withRate })
```

### 参数

**`factor`**

目标倍数，数。照 `Number()` 转换。应在 [`minAvailableVideoZoomFactor`](minavailablevideozoomfactor.md) 到 [`maxAvailableVideoZoomFactor`](maxavailablevideozoomfactor.md) 之间。

**`options.withRate`**

速度，数，必填。含义是每秒放大到 2 的 `withRate` 次方倍：`1` 是每秒放大一倍，`2` 是每秒放大到 4 倍。照 `Number()` 转换。

### 返回值

无（`undefined`）。方法当场返回，变焦在之后的一段时间里进行。变焦的过程在画面上看得到，**未在真机验证**。变焦什么时候结束没有事件。

### 异常

**`TypeError`**

- 没有 `withRate`：`rampToVideoZoomFactor needs options.withRate`（实测）。
- `factor` 转不出有限数：`rampToVideoZoomFactor must be a finite number, got …`。
- `withRate` 转不出有限数：`withRate must be a finite number, got …`。
- 系统拒绝这个倍数，而且系统给的原因不属于下面两种。什么样的值会被拒绝**未在真机验证**。

**`RangeError`、[`DOMException`](../dom-exception.md)**

系统拒绝时，抛哪一种照系统的原因分：系统说超出范围的是 `RangeError`，说现在的状态做不了的是 `DOMException`，`name` 是 `'InvalidStateError'`，别的是 `TypeError`。信息是 `rampToVideoZoomFactor: the system refused (…)`，括号里是系统给的原因。这一条来自代码，**未在真机验证**。

## 说明

- 没调 [`lockForConfiguration()`](lockforconfiguration.md) 时调它也不抛（实测）。推荐还是在锁着的时候调，和别的设置写在一起。
- 中途要停下，调 [`cancelVideoZoomRamp()`](cancelvideozoomramp.md)。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.rampToVideoZoomFactor(Math.min(2, device.maxAvailableVideoZoomFactor), { withRate: 4 });
  } finally {
    device.unlockForConfiguration();
  }
}
```

**效果**：画面在很短的时间里平滑地放大到 2 倍。**未在真机验证。**

## 对应的 iOS API

`-[AVCaptureDevice rampToVideoZoomFactor:withRate:]`。第二段参数放进 options 对象：`{ withRate }`。

## 参见

- [`videoZoomFactor`](videozoomfactor.md)：直接设倍数
- [`cancelVideoZoomRamp()`](cancelvideozoomramp.md)：停下
- [放大画面](../../guides/scanning.md#放大画面)
