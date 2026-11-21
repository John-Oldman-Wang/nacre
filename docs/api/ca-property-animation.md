---
type: reference
native: CAPropertyAnimation
status: partial
---

# `CAPropertyAnimation`

**`CAPropertyAnimation`** 表示改图层某一个属性的动画。它决定动画改哪个属性，也就决定了起点值、终点值、关键帧值该用什么类型。

它是 [`CABasicAnimation`](ca-basic-animation.md)、[`CAKeyframeAnimation`](ca-keyframe-animation.md) 和 [`CASpringAnimation`](ca-spring-animation.md) 的共同父类。

**继承关系**：`EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → `CAPropertyAnimation`

## 构造函数

不能用 `new` 创建。用子类创建，比如 [`CABasicAnimation.animationWithKeyPath()`](ca-basic-animation/animationwithkeypath.md)。

## 实例属性

还继承 [`CAAnimation`](ca-animation.md) 的属性，常用的是 `duration`、`repeatCount`、`timingFunction`。

| 属性 | 说明 |
| --- | --- |
| [`keyPath`](ca-property-animation/keypath.md) | 动画改哪个属性 |

## 事件

继承 [`CAAnimation`](ca-animation.md) 的 [`start`](ca-animation/start-event.md) 和 [`stop`](ca-animation/stop-event.md)。

## 能做动画的属性

`keyPath` 能用的名字，和每个名字对应的值的类型：

| `keyPath` | 值的类型 | 属于 |
| --- | --- | --- |
| `'opacity'`、`'cornerRadius'`、`'borderWidth'`、`'shadowOpacity'`、`'shadowRadius'`、`'zPosition'` | 数 | 所有图层 |
| `'position'` | `CGPoint` | 所有图层 |
| `'bounds'` | `CGRect` | 所有图层 |
| `'shadowOffset'` | `CGSize` | 所有图层 |
| `'backgroundColor'`、`'borderColor'`、`'shadowColor'` | [颜色](ui-color.md) | 所有图层 |
| `'contents'` | [`UIImage`](ui-image.md) | 所有图层 |
| `'transform'`、`'sublayerTransform'` | [`CATransform3D`](ca-transform-3d.md) | 所有图层 |
| `'transform.rotation'`、`'transform.rotation.x'`、`'transform.rotation.y'`、`'transform.rotation.z'` | 数，转过的角度，单位是[弧度](units.md) | 所有图层 |
| `'transform.scale'`、`'transform.scale.x'`、`'transform.scale.y'`、`'transform.scale.z'` | 数，倍数 | 所有图层 |
| `'transform.translation.x'`、`'transform.translation.y'`、`'transform.translation.z'` | 数，平移量，单位 [pt](units.md) | 所有图层 |
| `'transform.translation'` | `CGSize`：`width` 是 x 方向、`height` 是 y 方向的平移量，单位 pt | 所有图层 |
| `'lineWidth'`、`'miterLimit'`、`'strokeStart'`、`'strokeEnd'`、`'lineDashPhase'` | 数 | `CAShapeLayer` |
| `'fillColor'`、`'strokeColor'` | [颜色](ui-color.md) | `CAShapeLayer` |
| `'path'` | [`UIBezierPath`](ui-bezier-path.md) | `CAShapeLayer` |
| `'startPoint'`、`'endPoint'` | `CGPoint` | `CAGradientLayer` |

几个常被问到的情况：

- **`frame` 不能做动画。** 移动图层用 `'position'`（中心点的坐标），改大小用 `'bounds'`。
- **只转、只缩放、只平移时，用 `transform` 的分量。** `'transform.rotation.z'` 这类名字只改变换里的一个分量，起点值和终点值各是一个数，不用造整个矩阵。`'transform.rotation'` 和 `'transform.rotation.z'` 相同，都是在屏幕平面里转；`'transform.scale'` 同时改三个方向的倍数。转一整圈写 `toValue = 2 * Math.PI`。**屏幕上的效果未在模拟器验证。**
- **整个 `'transform'` 的值是 `CATransform3D`。** 写入时也可以给带齐 16 个字段的普通对象，规则和图层的 [`transform`](ca-layer/transform.md) 相同。
- **渐变的颜色不能做动画。** 表里没有 `colors` 和 `locations`。
- **起点值、终点值等的类型必须和 `keyPath` 对应。** 所以要先有 `keyPath` 才能设值。
- **数必须写成数，不能写成字符串。** 这些值位置上的字符串一律当作颜色。`fade.toValue = '0.5'` 不会被当成 0.5。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `anim.keyPath = @"opacity"` | `anim.keyPath = 'opacity'` |

## 参见

- [`CABasicAnimation`](ca-basic-animation.md)、[`CAKeyframeAnimation`](ca-keyframe-animation.md)、[`CASpringAnimation`](ca-spring-animation.md)：三种改属性的动画
- [`CALayer`](ca-layer.md)：各个属性的含义
