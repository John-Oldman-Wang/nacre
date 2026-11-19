---
type: reference
native: "+[CABasicAnimation animationWithKeyPath:]"
---

# `CABasicAnimation.animationWithKeyPath()` 静态方法

**`CABasicAnimation.animationWithKeyPath()`** 静态方法创建一个改指定属性的动画。

## 语法

```
CABasicAnimation.animationWithKeyPath(keyPath)
```

### 参数

**`keyPath`**

字符串，动画改哪个属性。[能做动画的属性](../ca-property-animation.md#能做动画的属性)那张表里的名字之一。

### 返回值

新建的 `CABasicAnimation`，[`keyPath`](../ca-property-animation/keypath.md) 是给的名字。

### 异常

**`TypeError`**

`keyPath` 不在表里，报错信息列出全部能用的名字：

```
TypeError: keyPath has no value "frame"; expected one of: backgroundColor / borderColor / …
```

## 示例

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
console.log(fade.keyPath);
```

**结果**：控制台输出 `opacity`。

## 对应的 iOS API

`+[CABasicAnimation animationWithKeyPath:]`。只认表里的名字，不认任意的键路径。

## 参见

- [`CABasicAnimation()`](constructor.md)：不指定属性地创建
- [能做动画的属性](../ca-property-animation.md#能做动画的属性)
