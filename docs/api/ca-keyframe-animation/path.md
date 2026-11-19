---
type: reference
native: CAKeyframeAnimation.path
---

# `CAKeyframeAnimation`：`path` 属性

**`path`** 属性是一条路径。设了它，图层沿这条路径移动。用于 `keyPath` 是 `'position'` 的动画。

## 值

[`UIBezierPath`](../ui-bezier-path.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 设了它，[`values`](values.md) 不起作用。
- 路径的坐标按图层的父图层的坐标系算，和 `position` 相同。单位是 [pt](../units.md)。
- 读出来是写进去的那个对象。和形状图层一样，图层保存的是写入时的路径，写入之后再修改这条路径，动画不会变。
- 图层朝向是否跟着行进方向转，由 [`rotationMode`](rotationmode.md) 决定。
- 沿路径匀速移动，把 [`calculationMode`](calculationmode.md) 设成 `'paced'`。不设时，路径上每一段用的时间相同，长的一段移动得快。

## 示例

```js
const trail = new UIBezierPath();
trail.moveToPoint(new CGPoint(30, 130));
trail.addQuadCurveToPoint(new CGPoint(270, 130), { controlPoint: new CGPoint(150, 10) });

const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.path = trail;
walk.calculationMode = 'paced';
walk.duration = 2.4;
console.log(walk.path === trail);
```

**效果**：控制台输出 `true`。加到图层上之后，图层沿一条向上拱起的弧线从左下移到右下，全程匀速。

## 对应的 iOS API

`CAKeyframeAnimation.path`（`CGPathRef`）。这里直接写 `UIBezierPath`，不用取 `.CGPath`。

## 参见

- [沿一条路径移动](../../guides/animation.md#沿一条路径移动)
- [`UIBezierPath`](../ui-bezier-path.md)
