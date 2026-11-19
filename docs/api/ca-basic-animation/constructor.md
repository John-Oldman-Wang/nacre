---
type: reference
native: "-[CABasicAnimation init]"
---

# `CABasicAnimation()` 构造函数

**`CABasicAnimation()`** 构造函数创建一个还没有指定属性的动画。

一般用 [`CABasicAnimation.animationWithKeyPath()`](animationwithkeypath.md)，一步建好并指定属性。

## 语法

```
new CABasicAnimation()
```

### 参数

无。

### 返回值

新建的 `CABasicAnimation`。它的 [`keyPath`](../ca-property-animation/keypath.md) 是 `null`，要先设 `keyPath` 才能设 `fromValue`、`toValue`、`byValue`。

## 示例

```js
const fade = new CABasicAnimation();
fade.keyPath = 'opacity';
fade.fromValue = 1;
fade.toValue = 0;
```

**结果**：得到一个把不透明度从 1 变到 0 的动画，和 `CABasicAnimation.animationWithKeyPath('opacity')` 相同。

## 对应的 iOS API

`[CABasicAnimation animation]`。

## 参见

- [`CABasicAnimation.animationWithKeyPath()`](animationwithkeypath.md)
