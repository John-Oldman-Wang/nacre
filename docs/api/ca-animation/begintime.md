---
type: reference
native: CAAnimation.beginTime
---

# `CAAnimation`：`beginTime` 属性

**`beginTime`** 属性是动画的开始时刻。

## 值

数，单位是秒。

- 可读，可写。
- 默认值是 `0`，表示加到图层上之后立刻开始。
- 基准是图层自己的时间，不是「加到图层上的那一刻」。读图层当前时间的能力还没有，所以单独一个动画不能用 `beginTime` 表示「0.5 秒后开始」。要推迟开始，用[定时器](../timers.md)推迟 `addAnimation()` 的调用，见[延迟开始](../../guides/animation.md#延迟开始)。
- 放在 [`CAAnimationGroup`](../ca-animation-group.md) 里的动画，`beginTime` 是相对于组开始的时刻，可以用来让成员先后开始。**未在模拟器验证。**

### 写错时

按 `Number()` 转换。转换结果不是有限数时抛 `TypeError`：`beginTime must be a finite number, got …`。

## 示例

```js
const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
radius.fromValue = 0;
radius.toValue = 10;
radius.duration = 0.6;

const appear = CABasicAnimation.animationWithKeyPath('opacity');
appear.fromValue = 0;
appear.toValue = 1;
appear.duration = 0.6;
appear.beginTime = 0.6;

const group = new CAAnimationGroup();
group.animations = [radius, appear];
group.duration = 1.2;
```

**效果**：组加到图层上之后，前 0.6 秒圆角变大，后 0.6 秒图层淡入。**未在模拟器验证。**

## 对应的 iOS API

`CAMediaTiming.beginTime`。

## 参见

- [延迟开始](../../guides/animation.md#延迟开始)
