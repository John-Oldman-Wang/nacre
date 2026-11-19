---
type: reference
native: CASpringAnimation.damping
---

# `CASpringAnimation`：`damping` 属性

**`damping`** 属性是弹簧的阻尼。阻尼越大，回弹越少；足够大时不回弹，直接停在终点。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 `10`。
- 不能是负数。给负数时的行为**未在模拟器验证**。
- 改了它，[`settlingDuration`](settlingduration.md)、[`perceptualDuration`](perceptualduration.md)、[`bounce`](bounce.md) 跟着变。

### 写错时

按 `Number()` 转换。转换结果不是有限数时抛 `TypeError`：`damping must be a finite number, got …`。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
const before = spring.settlingDuration;
spring.damping = 40;
console.log(before.toFixed(3), spring.settlingDuration.toFixed(3));
```

**结果**：控制台输出 `1.473 1.000`：阻尼从 10 调到 40，停下来需要的时间从 1.473 秒变成 1.000 秒。

## 对应的 iOS API

`CASpringAnimation.damping`。

## 参见

- [`settlingDuration`](settlingduration.md)
