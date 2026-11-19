---
type: reference
native: CASpringAnimation.initialVelocity
---

# `CASpringAnimation`：`initialVelocity` 属性

**`initialVelocity`** 属性是动画开始时弹簧末端已有的速度。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 `0`。
- 0 表示开始时静止。正数朝终点方向，负数朝反方向。
- 改了它，[`settlingDuration`](settlingduration.md)、[`perceptualDuration`](perceptualduration.md)、[`bounce`](bounce.md) 跟着变。

### 写错时

按 `Number()` 转换。转换结果不是有限数时抛 `TypeError`：`initialVelocity must be a finite number, got …`。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.initialVelocity = 5;
console.log(spring.initialVelocity);
```

**结果**：控制台输出 `5`。加到图层上之后，图层一开始就带着朝终点方向的速度。**画面上的表现未在模拟器验证。**

## 对应的 iOS API

`CASpringAnimation.initialVelocity`。

## 参见

- [`settlingDuration`](settlingduration.md)
