---
type: reference
native: CASpringAnimation.settlingDuration
---

# `CASpringAnimation`：`settlingDuration` 属性

**`settlingDuration`** 属性是弹簧停下来需要的时间。

## 值

数，单位是秒。

- 只读。给它赋值抛 `TypeError`。
- 由 [`mass`](mass.md)、[`stiffness`](stiffness.md)、[`damping`](damping.md)、[`initialVelocity`](initialvelocity.md) 算出，每次读都是按当前的值算的。所以要在这几项都设好之后再读。
- 默认参数下是 1.473。
- 没有变化事件：它只随上面几项变化，而那几项只有代码自己会改。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.stiffness = 120;
spring.damping = 8;
spring.duration = spring.settlingDuration;
```

**效果**：动画的时长正好是弹簧停下来需要的时间。推荐这样设 `duration`。

## 对应的 iOS API

`CASpringAnimation.settlingDuration`。

## 参见

- [`perceptualDuration`](perceptualduration.md)
- [`CAAnimation.duration`](../ca-animation/duration.md)
