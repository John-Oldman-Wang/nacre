---
type: reference
native: CALayer.transform
---

# `CALayer`：`transform` 属性

**`transform`** 属性是图层的三维变换：沿 x、y、z 三个方向的缩放、旋转、平移和透视。

## 值

[`CATransform3D`](../ca-transform-3d.md)。

- 可读，可写。
- 默认值是单位矩阵（`isIdentity` 是 `true`），表示不做任何变换。设回 [`CATransform3D.identity`](../ca-transform-3d/identity.md) 恢复原样。
- 写入时可以给 `CATransform3D`，也可以给带齐 `m11` 到 `m44` 全部 16 个字段的普通对象。透视常这样写：`{ ...CATransform3D.identity, m34: -1 / 500 }`，见[透视](../ca-transform-3d.md#透视)。
- 读出来的是一个新的 `CATransform3D`，字段只读。改了读出来的对象不影响图层，要改就整体赋一个新的，见[结构体](../structs.md)。
- 变换以图层的中心为原点：旋转绕中心转，缩放以中心为基准。视图自己的图层，原点跟着视图的 [`anchorPoint`](../ui-view/anchorpoint.md)。**屏幕上的效果未在模拟器验证。**
- 视图自己的图层：给视图的 [`transform`](../ui-view/transform.md) 写一个二维变换后，`view.layer.transform` 读出来是效果相同的三维变换，和 [`CATransform3D.fromAffineTransform()`](../ca-transform-3d/fromaffinetransform.md) 算出来的一样。
- 写进去的带小数的数，读回来在 1e-9 以内相同；逐位相等**未在模拟器验证**。

只在屏幕平面里平移、缩放、旋转时，视图上用视图的 `transform`，它的值是二维的 [`CGAffineTransform`](../cg-affine-transform.md)，写起来更短。要绕 x 轴或 y 轴转、要透视时，写 `view.layer.transform`。

### 写错时

**`TypeError`**

- 给的不是对象：`transform needs an object with all of: m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44`。
- 缺字段，或字段转不出有限的数：`transform is missing m12, or it is not a finite number`，中间是缺的字段名。

出错时属性保持原值。

## 示例

```js
const card = new CALayer();
card.frame = new CGRect(60, 160, 200, 120);
card.transform = CATransform3D.rotation(Math.PI / 4, 0, 1, 0)
  .concat({ ...CATransform3D.identity, m34: -1 / 500 });
console.log(card.transform.m34);
```

**结果**：控制台输出 `-0.002`。图层绕竖直的中线转 45°，带透视，一侧近一侧远。**屏幕上的样子未在模拟器验证。**

给变换做动画，`keyPath` 用 `'transform'`，或者只改一个分量的 `'transform.rotation.y'` 这类名字，见[能做动画的属性](../ca-property-animation.md#能做动画的属性)。

## 对应的 iOS API

`CALayer.transform`。`CATransform3DMakeRotation(a, 0, 1, 0)` 写成 `CATransform3D.rotation(a, 0, 1, 0)`。

## 参见

- [`CATransform3D`](../ca-transform-3d.md)：变换怎么造、怎么组合
- [`sublayerTransform`](sublayertransform.md)：作用在全部子图层上的变换
- [`isDoubleSided`](isdoublesided.md)：转到背面时画不画
- [`UIView.transform`](../ui-view/transform.md)：视图上的二维变换
