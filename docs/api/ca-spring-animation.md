---
type: reference
native: CASpringAnimation
status: partial
---

# `CASpringAnimation`

**`CASpringAnimation`** 表示用弹簧的方式让一个属性到达终点的动画：属性越过终点，回弹几次后停住。

它是 [`CABasicAnimation`](ca-basic-animation.md) 的子类，`keyPath`、`fromValue`、`toValue`、`byValue` 的用法相同。不同的是过程由四个物理量决定，不由时长和时间曲线决定：

- `stiffness`（劲度）越大，弹簧越硬，动得越快。
- `damping`（阻尼）越大，回弹越少。足够大时不回弹，直接停在终点。
- `mass`（质量）越大，动得越慢，回弹持续得越久。
- `initialVelocity`（初速度）是动画开始时已有的速度。

弹簧停下来需要多久由这四个量算出，读 [`settlingDuration`](ca-spring-animation/settlingduration.md) 得到。推荐把 `duration` 设成 `settlingDuration`。`duration` 和 `settlingDuration` 不一致时动画怎么表现，**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → [`CAPropertyAnimation`](ca-property-animation.md) → [`CABasicAnimation`](ca-basic-animation.md) → `CASpringAnimation`

## 构造函数

[`CASpringAnimation()`](ca-spring-animation/constructor.md)

创建一个还没有指定属性的弹簧动画。

## 静态方法

[`CASpringAnimation.animationWithKeyPath()`](ca-spring-animation/animationwithkeypath.md)

创建一个指定了属性的弹簧动画。

## 实例属性

还继承 [`CABasicAnimation`](ca-basic-animation.md) 的 `fromValue`、`toValue`、`byValue`，[`CAPropertyAnimation`](ca-property-animation.md) 的 `keyPath`，以及 [`CAAnimation`](ca-animation.md) 的属性。

四个物理量和一个开关：

| 属性 | 说明 |
| --- | --- |
| [`mass`](ca-spring-animation/mass.md) | 质量 |
| [`stiffness`](ca-spring-animation/stiffness.md) | 劲度 |
| [`damping`](ca-spring-animation/damping.md) | 阻尼 |
| [`initialVelocity`](ca-spring-animation/initialvelocity.md) | 初速度 |
| [`allowsOverdamping`](ca-spring-animation/allowsoverdamping.md) | 阻尼大到不再回弹之后，继续加大阻尼是否让到达终点变得更慢 |

由上面几项算出来的三个值：

| 属性 | 说明 |
| --- | --- |
| [`settlingDuration`](ca-spring-animation/settlingduration.md) <small>只读</small> | 弹簧停下来需要的时间 |
| [`perceptualDuration`](ca-spring-animation/perceptualduration.md) <small>只读</small> | 看起来动画持续的时间 |
| [`bounce`](ca-spring-animation/bounce.md) <small>只读</small> | 回弹的程度 |

## 事件

继承 [`CAAnimation`](ca-animation.md) 的 [`start`](ca-animation/start-event.md) 和 [`stop`](ca-animation/stop-event.md)。

## 示例

```js
const dot = new CALayer();
dot.frame = new CGRect(20, 70, 20, 20);
dot.backgroundColor = 'systemBlue';

const spring = CASpringAnimation.animationWithKeyPath('position');
spring.fromValue = new CGPoint(dot.position.x, -40);
spring.toValue = dot.position;
spring.stiffness = 120;
spring.damping = 8;
spring.duration = spring.settlingDuration;
dot.addAnimation(spring, { forKey: 'drop' });
```

**效果**：图层显示在屏幕上之后，从上方落下来，越过原来的位置，上下回弹几次后停在原位。**回弹的样子未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CASpringAnimation animationWithKeyPath:@"position"]` | `CASpringAnimation.animationWithKeyPath('position')` |
| `spring.damping = 8` | `spring.damping = 8` |
| `spring.duration = spring.settlingDuration` | `spring.duration = spring.settlingDuration` |

## 参见

- [用弹簧的方式到达终点](../guides/animation.md#用弹簧的方式到达终点)
- [`CABasicAnimation`](ca-basic-animation.md)：起点值和终点值的写法
