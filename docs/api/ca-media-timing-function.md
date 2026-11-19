---
type: reference
native: CAMediaTimingFunction
status: partial
---

# `CAMediaTimingFunction`

**`CAMediaTimingFunction`** 表示一条时间曲线。时间曲线决定动画在时间上怎么分配进度：匀速，还是先慢后快。它赋给动画的 [`timingFunction`](ca-animation/timingfunction.md)，或者事务的 [`setAnimationTimingFunction()`](ca-transaction/setanimationtimingfunction.md)。

**继承关系**：`EventTarget` → `NSObject` → `CAMediaTimingFunction`

## 构造函数

不能用 `new` 创建。用下面两个静态方法取得。

## 静态方法

[`CAMediaTimingFunction.functionWithName()`](ca-media-timing-function/functionwithname.md)

按名字取得五条内置曲线之一。

[`CAMediaTimingFunction.functionWithControlPoints()`](ca-media-timing-function/functionwithcontrolpoints.md)

用两个控制点的坐标创建一条自定义曲线。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`controlPointAtIndex()`](ca-media-timing-function/controlpointatindex.md) | 读曲线的端点和控制点 |

## 曲线的形状

曲线画在一个边长为 1 的正方形里。横轴是时间的比例，0 是动画开始，1 是结束。纵轴是进度的比例，0 是起点值，1 是终点值。曲线是一条三次贝塞尔曲线，从 (0, 0) 到 (1, 1)，形状由中间的两个控制点决定。曲线陡的地方，属性变化得快；平的地方变化得慢。

动画的 `timingFunction` 是 `null` 时匀速进行。

## 示例

```js
const ease = CAMediaTimingFunction.functionWithName('easeInEaseOut');
console.log(String(ease.controlPointAtIndex(1)), String(ease.controlPointAtIndex(2)));
```

**结果**：控制台输出两个控制点，约为 `CGPoint(0.42, 0)` 和 `CGPoint(0.58, 1)`。数值是单精度浮点数，输出时带有末位误差。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn]` | `CAMediaTimingFunction.functionWithName('easeIn')` |
| `[CAMediaTimingFunction functionWithControlPoints:a :b :c :d]` | `CAMediaTimingFunction.functionWithControlPoints(a, b, c, d)` |
| `[fn getControlPointAtIndex:1 values:v]` | `fn.controlPointAtIndex(1)` |

## 参见

- [改变速度曲线](../guides/animation.md#改变速度曲线)
- [`CAAnimation.timingFunction`](ca-animation/timingfunction.md)
