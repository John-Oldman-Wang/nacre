---
type: reference
native: CAAnimation.timingFunction
---

# `CAAnimation`：`timingFunction` 属性

**`timingFunction`** 属性是动画的[时间曲线](../ca-media-timing-function.md)，决定动画在时间上怎么分配进度：匀速，还是先慢后快。

## 值

[`CAMediaTimingFunction`](../ca-media-timing-function.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- `null` 时动画匀速进行。
- 对 [`CAAnimationGroup`](../ca-animation-group.md)，组的时间曲线作用于整组。
- [`CAKeyframeAnimation`](../ca-keyframe-animation.md) 要给相邻两个值之间各用一条曲线时，用它的 [`timingFunctions`](../ca-keyframe-animation/timingfunctions.md)。

## 示例

```js
const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = new CGPoint(30, 80);
move.toValue = new CGPoint(270, 80);
move.duration = 0.6;
move.timingFunction = CAMediaTimingFunction.functionWithName('easeOut');
```

**效果**：加到图层上之后，图层开始时移动得快，接近终点时慢下来。**未在模拟器验证。**

## 对应的 iOS API

`CAAnimation.timingFunction`。

## 参见

- [`CAMediaTimingFunction`](../ca-media-timing-function.md)：五条内置曲线和自定义曲线
