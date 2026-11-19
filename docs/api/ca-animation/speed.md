---
type: reference
native: CAAnimation.speed
---

# `CAAnimation`：`speed` 属性

**`speed`** 属性是动画播放速度的倍数。

## 值

数，没有单位，是倍数。

- 可读，可写。
- 默认值是 `1`。
- 2 是两倍速，时长减半。0 是停住。
- 效果**未在模拟器验证**。

### 写错时

按 `Number()` 转换。转换结果不是有限数时抛 `TypeError`：`speed must be a finite number, got …`。

## 示例

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 1;
fade.speed = 2;
```

**效果**：加到图层上之后，淡出用 0.5 秒播完。**未在模拟器验证。**

## 对应的 iOS API

`CAMediaTiming.speed`。

## 参见

- [`duration`](duration.md)
- [`timeOffset`](timeoffset.md)
