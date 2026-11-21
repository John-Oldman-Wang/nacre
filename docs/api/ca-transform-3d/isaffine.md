---
type: reference
native: CATransform3DIsAffine
---

# `CATransform3D`：`isAffine` 属性

**`isAffine`** 属性表示这个变换能不能用二维的 [`CGAffineTransform`](../cg-affine-transform.md) 表示，也就是只在屏幕平面里平移、缩放、旋转，不碰 z 方向，没有透视。

## 值

布尔。

- `true`：下面这些数正好是这些值：`m13`、`m14`、`m23`、`m24`、`m31`、`m32`、`m34`、`m43` 是 0，`m33`、`m44` 是 1。这时 [`affineTransform`](affinetransform.md) 给出的二维变换和它的效果相同。
- `false`：其他情况，比如有 z 方向的平移、绕 x 轴或 y 轴的旋转、透视。比较是精确相等，没有容差。
- 只读。

## 示例

```js
console.log(CATransform3D.translation(5, 6).isAffine);
console.log(CATransform3D.translation(5, 6, 1).isAffine);

const perspective = new CATransform3D(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, -1 / 500,
  0, 0, 0, 1);
console.log(perspective.isAffine);
```

**结果**：依次输出 `true`、`false`、`false`。在 z 方向平移和带透视的都不能用二维变换表示。

## 对应的 iOS API

`CATransform3DIsAffine(t)`。

## 参见

- [`affineTransform`](affinetransform.md)
- [`CATransform3D.fromAffineTransform()`](fromaffinetransform.md)
- [结构体](../structs.md)：所有结构体共同的规则
