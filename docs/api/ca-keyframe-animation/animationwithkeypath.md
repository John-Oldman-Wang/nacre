---
type: reference
native: "+[CAKeyframeAnimation animationWithKeyPath:]"
---

# `CAKeyframeAnimation.animationWithKeyPath()` 静态方法

**`CAKeyframeAnimation.animationWithKeyPath()`** 静态方法创建一个改指定属性的关键帧动画。

## 语法

```
CAKeyframeAnimation.animationWithKeyPath(keyPath)
```

### 参数

**`keyPath`**

字符串，动画改哪个属性。[能做动画的属性](../ca-property-animation.md#能做动画的属性)那张表里的名字之一。

### 返回值

新建的 `CAKeyframeAnimation`，[`keyPath`](../ca-property-animation/keypath.md) 是给的名字。

### 异常

**`TypeError`**

`keyPath` 不在表里，报错信息列出全部能用的名字：`keyPath has no value "frame"; expected one of: …`。

## 示例

```js
const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.values = [new CGPoint(0, 0), new CGPoint(10, 20), new CGPoint(30, 5)];
console.log(walk.keyPath);
```

**结果**：控制台输出 `position`。

## 对应的 iOS API

`+[CAKeyframeAnimation animationWithKeyPath:]`。

## 参见

- [`CAKeyframeAnimation()`](constructor.md)：不指定属性地创建
