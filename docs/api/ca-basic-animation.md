---
type: reference
native: CABasicAnimation
status: partial
---

# `CABasicAnimation`

**`CABasicAnimation`** 表示让图层的一个属性从一个值变到另一个值的动画。改哪个属性由 [`keyPath`](ca-property-animation/keypath.md) 指定，起点和终点由 `fromValue`、`toValue`、`byValue` 给出。

起点值、终点值的类型由 `keyPath` 决定：`'opacity'` 要数，`'position'` 要 `CGPoint`，`'strokeColor'` 要颜色，`'path'` 要 `UIBezierPath`。全表见[能做动画的属性](ca-property-animation.md#能做动画的属性)。所以要先有 `keyPath` 才能设值。

**继承关系**：`EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → [`CAPropertyAnimation`](ca-property-animation.md) → `CABasicAnimation`

[`CASpringAnimation`](ca-spring-animation.md) 是它的子类。怎么用它做常见的动画，见指南[做动画](../guides/animation.md)。

## 构造函数

[`CABasicAnimation()`](ca-basic-animation/constructor.md)

创建一个还没有指定属性的动画。`keyPath` 是 `null`。

## 静态方法

[`CABasicAnimation.animationWithKeyPath()`](ca-basic-animation/animationwithkeypath.md)

创建一个指定了属性的动画。**一般用这个。**

## 实例属性

还继承 [`CAPropertyAnimation`](ca-property-animation.md) 的 `keyPath`，以及 [`CAAnimation`](ca-animation.md) 的属性，常用的是 `duration`、`repeatCount`、`autoreverses`、`timingFunction`。

| 属性 | 说明 |
| --- | --- |
| [`fromValue`](ca-basic-animation/fromvalue.md) | 起点值 |
| [`toValue`](ca-basic-animation/tovalue.md) | 终点值 |
| [`byValue`](ca-basic-animation/byvalue.md) | 变化量 |

三个值可以只给一部分。没给的那一端用属性的值：只给 `toValue`，动画从属性的值变到 `toValue`；只给 `fromValue`，从 `fromValue` 变到属性的值。**未在模拟器验证**；例子里都把两端写全。

## 事件

继承 [`CAAnimation`](ca-animation.md) 的 [`start`](ca-animation/start-event.md) 和 [`stop`](ca-animation/stop-event.md)。

## 示例

```js
const layer = new CALayer();
layer.frame = new CGRect(20, 20, 60, 60);
layer.backgroundColor = 'systemBlue';

const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0.2;
fade.duration = 0.5;
layer.addAnimation(fade, { forKey: 'fade' });
```

**效果**：图层显示在屏幕上之后，在 0.5 秒里从完全显示变淡到 0.2，然后跳回完全显示（属性的值还是 1）。要停在终点的写法见[让图层停在终点](../guides/animation.md#让图层停在终点)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CABasicAnimation animationWithKeyPath:@"opacity"]` | `CABasicAnimation.animationWithKeyPath('opacity')` |
| `[CABasicAnimation animation]` | `new CABasicAnimation()` |
| `anim.toValue = @1` | `anim.toValue = 1` |
| `anim.toValue = [NSValue valueWithCGPoint:p]` | `anim.toValue = p` |
| `anim.toValue = (id)color.CGColor` | `anim.toValue = 'systemBlue'` |
| `anim.toValue = (id)path.CGPath` | `anim.toValue = path` |

## 参见

- [做动画](../guides/animation.md)
- [`CAPropertyAnimation`](ca-property-animation.md)：能做动画的属性
- [`CASpringAnimation`](ca-spring-animation.md)：用弹簧的方式到达终点
- [颜色](ui-color.md)：颜色值的写法
