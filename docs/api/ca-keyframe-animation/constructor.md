---
type: reference
native: "-[CAKeyframeAnimation init]"
---

# `CAKeyframeAnimation()` 构造函数

**`CAKeyframeAnimation()`** 构造函数创建一个还没有指定属性的关键帧动画。

一般用 [`CAKeyframeAnimation.animationWithKeyPath()`](animationwithkeypath.md)，一步建好并指定属性。

## 语法

```
new CAKeyframeAnimation()
```

### 参数

无。

### 返回值

新建的 `CAKeyframeAnimation`。它的 [`keyPath`](../ca-property-animation/keypath.md) 是 `null`，要先设 `keyPath` 才能设 [`values`](values.md)。

## 示例

```js
const blink = new CAKeyframeAnimation();
console.log(blink.keyPath, blink.values, blink.calculationMode);
```

**结果**：控制台输出 `null null linear`。

## 对应的 iOS API

`[CAKeyframeAnimation animation]`。

## 参见

- [`CAKeyframeAnimation.animationWithKeyPath()`](animationwithkeypath.md)
