---
type: reference
native: CASpringAnimation.perceptualDuration
---

# `CASpringAnimation`：`perceptualDuration` 属性

**`perceptualDuration`** 属性是看起来动画持续的时间，比 [`settlingDuration`](settlingduration.md) 短。

## 值

数，单位是秒。

- 只读。给它赋值抛 `TypeError`。
- 由 [`mass`](mass.md)、[`stiffness`](stiffness.md)、[`damping`](damping.md)、[`initialVelocity`](initialvelocity.md) 算出，每次读都是按当前的值算的。所以要在这几项都设好之后再读。
- 默认参数下是 0.628。
- 没有变化事件：它只随上面几项变化，而那几项只有代码自己会改。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
console.log(spring.perceptualDuration.toFixed(3));
```

**结果**：控制台输出 `0.628`。

## 对应的 iOS API

`CASpringAnimation.perceptualDuration`。

## 参见

- [`settlingDuration`](settlingduration.md)
- [`bounce`](bounce.md)
