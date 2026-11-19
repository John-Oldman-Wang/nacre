---
type: reference
native: CAAnimation.duration
---

# `CAAnimation`：`duration` 属性

**`duration`** 属性是动画播放一遍的时长。

## 值

数，单位是秒。

- 可读，可写。
- 默认值是 `0`。
- **0 不表示「没有动画」。** 加到图层上时，0 被换成当前[事务](../ca-transaction.md)的时长，没有设过就是 iOS 的默认值 0.25 秒。**未在模拟器验证。**
- [`autoreverses`](autoreverses.md) 是 `true` 时，一遍的时长变成 `duration` 的两倍。
- 放在 [`CAAnimationGroup`](../ca-animation-group.md) 里的动画没有设 `duration` 时，用组的时长。
- 对 [`CASpringAnimation`](../ca-spring-animation.md)，弹簧停下来需要多久由物理量算出，读 [`settlingDuration`](../ca-spring-animation/settlingduration.md)。

### 写错时

按 `Number()` 转换。转换结果不是有限数时抛 `TypeError`：`duration must be a finite number, got …`。

## 示例

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
console.log(fade.duration);
```

**结果**：控制台输出 `0.3`。加到图层上之后，淡出用 0.3 秒播完。

## 对应的 iOS API

`CAMediaTiming.duration`（`CFTimeInterval`）。

## 参见

- [`repeatCount`](repeatcount.md)：播几遍
- [`CATransaction.setAnimationDuration()`](../ca-transaction/setanimationduration.md)：`duration` 是 0 时用的时长
