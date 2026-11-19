---
type: reference
native: "-[CASpringAnimation init]"
---

# `CASpringAnimation()` 构造函数

**`CASpringAnimation()`** 构造函数创建一个还没有指定属性的弹簧动画。

一般用 [`CASpringAnimation.animationWithKeyPath()`](animationwithkeypath.md)。

## 语法

```
new CASpringAnimation()
```

### 参数

无。

### 返回值

新建的 `CASpringAnimation`。它的 `keyPath` 是 `null`，四个物理量是默认值：`mass` 1、`stiffness` 100、`damping` 10、`initialVelocity` 0。

## 示例

```js
const spring = new CASpringAnimation();
spring.keyPath = 'position';
console.log(spring.mass, spring.stiffness, spring.damping);
```

**结果**：控制台输出 `1 100 10`。

## 对应的 iOS API

`[CASpringAnimation animation]`。

## 参见

- [`CASpringAnimation.animationWithKeyPath()`](animationwithkeypath.md)
