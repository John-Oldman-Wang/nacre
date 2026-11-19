---
type: reference
native: CASpringAnimation.bounce
---

# `CASpringAnimation`：`bounce` 属性

**`bounce`** 属性是回弹的程度。

## 值

数，没有单位。0 是不回弹，越大回弹越明显；负数表示比不回弹还慢地到达终点。

- 只读。给它赋值抛 `TypeError`。
- 由 [`mass`](mass.md)、[`stiffness`](stiffness.md)、[`damping`](damping.md)、[`initialVelocity`](initialvelocity.md) 算出，每次读都是按当前的值算的。所以要在这几项都设好之后再读。
- 默认参数下是 0.5。
- 没有变化事件：它只随上面几项变化，而那几项只有代码自己会改。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
console.log(spring.bounce.toFixed(3));
```

**结果**：控制台输出 `0.500`。

## 对应的 iOS API

`CASpringAnimation.bounce`。

## 参见

- [`damping`](damping.md)
- [`perceptualDuration`](perceptualduration.md)
