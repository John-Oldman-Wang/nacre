---
type: reference
native: "+[CASpringAnimation animationWithKeyPath:]"
---

# `CASpringAnimation.animationWithKeyPath()` 静态方法

**`CASpringAnimation.animationWithKeyPath()`** 静态方法创建一个改指定属性的弹簧动画。

## 语法

```
CASpringAnimation.animationWithKeyPath(keyPath)
```

### 参数

**`keyPath`**

字符串，动画改哪个属性。[能做动画的属性](../ca-property-animation.md#能做动画的属性)那张表里的名字之一。

### 返回值

新建的 `CASpringAnimation`，`keyPath` 是给的名字，四个物理量是默认值。

### 异常

**`TypeError`**

`keyPath` 不在表里，报错信息列出全部能用的名字：`keyPath has no value "frame"; expected one of: …`。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
console.log(spring instanceof CABasicAnimation);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`+[CASpringAnimation animationWithKeyPath:]`。

## 参见

- [`CASpringAnimation()`](constructor.md)
