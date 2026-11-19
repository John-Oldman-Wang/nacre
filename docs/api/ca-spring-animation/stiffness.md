---
type: reference
native: CASpringAnimation.stiffness
---

# `CASpringAnimation`：`stiffness` 属性

**`stiffness`** 属性是弹簧的劲度。劲度越大，弹簧越硬，动得越快。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 `100`。
- 要大于 0。给 0 或负数时的行为**未在模拟器验证**。
- 改了它，[`settlingDuration`](settlingduration.md)、[`perceptualDuration`](perceptualduration.md)、[`bounce`](bounce.md) 跟着变。

### 写错时

按 `Number()` 转换。转换结果不是有限数时抛 `TypeError`：`stiffness must be a finite number, got …`。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.stiffness = 120;
console.log(spring.stiffness);
```

**结果**：控制台输出 `120`。

## 对应的 iOS API

`CASpringAnimation.stiffness`。

## 参见

- [`settlingDuration`](settlingduration.md)
