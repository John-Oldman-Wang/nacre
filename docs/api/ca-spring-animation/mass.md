---
type: reference
native: CASpringAnimation.mass
---

# `CASpringAnimation`：`mass` 属性

**`mass`** 属性是弹簧末端物体的质量。质量越大，动得越慢，回弹持续得越久。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 `1`。
- 要大于 0。给 0 或负数时的行为**未在模拟器验证**。
- 改了它，[`settlingDuration`](settlingduration.md)、[`perceptualDuration`](perceptualduration.md)、[`bounce`](bounce.md) 跟着变。

### 写错时

按 `Number()` 转换。转换结果不是有限数时抛 `TypeError`：`mass must be a finite number, got …`。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
const before = spring.settlingDuration;
spring.mass = 3;
console.log(spring.settlingDuration > before);
```

**结果**：控制台输出 `true`：质量变大，停下来要更久。**未在模拟器验证。**

## 对应的 iOS API

`CASpringAnimation.mass`。

## 参见

- [`settlingDuration`](settlingduration.md)
