---
type: reference
native: CATransform3DRotate
---

# `CATransform3D`：`rotate()` 方法

**`rotate()`** 方法在调用者前面加一步旋转：先旋转，再做调用者的变换。

## 语法

```
rotate(radians, x, y, z)
```

### 参数

**`radians`**

旋转的角度，单位是[弧度](../units.md)。

**`x`**、**`y`**、**`z`**

转轴的方向，和 [`CATransform3D.rotation()`](rotation.md) 的参数相同。

### 返回值

新的 `CATransform3D`，等于 `CATransform3D.rotation(radians, x, y, z).concat(调用者)`。调用者不变。

### 异常

**`RangeError`**

转轴是零向量，包括 `x`、`y`、`z` 都不给：`rotation needs a non-zero axis (x, y, z)`。

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`，末尾是收到的值。

## 说明

旋转在前，所以调用者如果带透视，透视作用在转过之后的图层上。这是加透视最常用的写法：先造一个只有透视的矩阵，再调 `rotate()`。

## 示例

```js
const perspective = new CATransform3D(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, -1 / 500,
  0, 0, 0, 1);

const card = new CALayer();
card.transform = perspective.rotate(Math.PI / 4, 0, 1, 0);
console.log(card.transform.isAffine);
```

**效果**

- 图层绕竖直的中线转 45°，转向屏幕里面的一侧变小。**屏幕上的样子未在模拟器验证。**
- 控制台输出 `false`。

## 对应的 iOS API

`CATransform3DRotate(t, angle, x, y, z)` 写成 `t.rotate(angle, x, y, z)`，顺序相同。

## 参见

- [`CATransform3D.rotation()`](rotation.md)
- [透视](../ca-transform-3d.md#透视)
- [结构体](../structs.md)：所有结构体共同的规则
