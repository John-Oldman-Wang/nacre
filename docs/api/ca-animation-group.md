---
type: reference
native: CAAnimationGroup
status: partial
---

# `CAAnimationGroup`

**`CAAnimationGroup`** 表示一组动画。组里的动画作为一个整体加到同一个图层上，一起开始，由组统一控制时长、重复和时间曲线。

组没有 `keyPath`，每个成员各有自己的 `keyPath`。

- 组的 `duration` 是整组的时长。成员没有设 `duration` 时，用组的时长。成员的时长超过组的时长时，超出的部分不播放。**后一句未在模拟器验证。**
- 组的 `timingFunction`、`repeatCount`、`autoreverses` 作用于整组。
- 成员的 `beginTime` 是相对于组开始的时刻，可以用来让成员先后开始。**未在模拟器验证。**
- 要知道整组何时结束，在组上监听 `stop`。成员上的 `start` 和 `stop` 是否派发，**未在模拟器验证**。

不需要统一控制时，也可以不用组，直接把几个动画分别加到图层上。在同一段代码里加的动画一起开始。

**继承关系**：`EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → `CAAnimationGroup`

## 构造函数

[`CAAnimationGroup()`](ca-animation-group/constructor.md)

创建一个空的动画组。

## 实例属性

还继承 [`CAAnimation`](ca-animation.md) 的属性，常用的是 `duration`、`repeatCount`、`autoreverses`、`timingFunction`。

| 属性 | 说明 |
| --- | --- |
| [`animations`](ca-animation-group/animations.md) | 组里的动画 |

## 事件

继承 [`CAAnimation`](ca-animation.md) 的 [`start`](ca-animation/start-event.md) 和 [`stop`](ca-animation/stop-event.md)。

## 示例

```js
const dot = new CALayer();
dot.frame = new CGRect(20, 70, 20, 20);
dot.backgroundColor = 'systemBlue';

const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
radius.fromValue = 0;
radius.toValue = 10;

const appear = CABasicAnimation.animationWithKeyPath('opacity');
appear.fromValue = 0;
appear.toValue = 1;

const group = new CAAnimationGroup();
group.animations = [radius, appear];
group.duration = 1.2;
dot.addAnimation(group, { forKey: 'intro' });
```

**效果**：图层显示在屏幕上之后，在 1.2 秒里从透明的方块变成完全显示的圆。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CAAnimationGroup animation]` | `new CAAnimationGroup()` |
| `group.animations = @[a, b]` | `group.animations = [a, b]` |

## 参见

- [几个属性一起动](../guides/animation.md#几个属性一起动)
