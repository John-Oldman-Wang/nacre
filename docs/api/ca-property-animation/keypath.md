---
type: reference
native: CAPropertyAnimation.keyPath
---

# `CAPropertyAnimation`：`keyPath` 属性

**`keyPath`** 属性指定动画改图层的哪个属性。它也决定了起点值、终点值、关键帧值该用什么类型。

## 值

字符串，[能做动画的属性](../ca-property-animation.md#能做动画的属性)那张表里的名字之一；或者 `null`。

- 可读，可写。
- 用 `animationWithKeyPath()` 创建时，是创建时给的名字。用 `new` 创建时是 `null`。
- 是 `null` 时，不能设 `fromValue`、`toValue`、`byValue`、`values`，设了抛 `TypeError`。

### 写错时

写入表里没有的名字：不抛异常，控制台输出一条警告，列出全部能用的名字，`keyPath` 保持原来的值：

```
[Nacre] keyPath has no value "frame"; expected one of: backgroundColor / borderColor / …, ignored
```

`animationWithKeyPath()` 的参数写错时抛异常，见 [`CABasicAnimation.animationWithKeyPath()`](../ca-basic-animation/animationwithkeypath.md)。

## 示例

```js
const fade = new CABasicAnimation();
console.log(fade.keyPath);
fade.keyPath = 'opacity';
fade.fromValue = 1;
fade.toValue = 0;
console.log(fade.keyPath);
```

**结果**：先输出 `null`，再输出 `opacity`。

## 对应的 iOS API

`CAPropertyAnimation.keyPath`。只认表里的名字，不认任意的键路径。

## 参见

- [能做动画的属性](../ca-property-animation.md#能做动画的属性)
- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
