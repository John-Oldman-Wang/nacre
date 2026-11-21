---
type: reference
native: CATransform3DMakeRotation
---

# `CATransform3D.rotation()` 静态方法

**`CATransform3D.rotation()`** 静态方法创建一个绕某根轴旋转的变换。

## 语法

```
CATransform3D.rotation(radians, x, y, z)
```

### 参数

**`radians`**

旋转的角度，单位是[弧度](../units.md)，不是度。角度换算成弧度：`角度 * Math.PI / 180`。

**`x`**、**`y`**、**`z`**

转轴的方向。转轴穿过原点（图层的中心），沿 (x, y, z) 这个方向。只看方向，不看长度：`(0, 0, 1)` 和 `(0, 0, 5)` 得到同一个变换。常用的三根轴：

| 转轴 | 写法 | 效果 |
| --- | --- | --- |
| z 轴 | `(0, 0, 1)` | 在屏幕平面里转。正值在屏幕上是顺时针，和 [`CGAffineTransform.rotation()`](../cg-affine-transform/rotation.md) 相同 |
| y 轴 | `(0, 1, 0)` | 绕竖直的中线转，像翻开一页书 |
| x 轴 | `(1, 0, 0)` | 绕水平的中线转，像翻日历 |

方向按右手定则：右手拇指指向转轴的方向，四指弯曲的方向是正方向。比如绕 x 轴转 90° 时，y 轴转到 z 轴的位置。

### 返回值

新的 `CATransform3D`。只有旋转，`m41`、`m42`、`m43` 和透视用的 `m14`、`m24`、`m34` 都是 0。

### 异常

**`RangeError`**

转轴是零向量，包括 `x`、`y`、`z` 都不给：`rotation needs a non-zero axis (x, y, z)`。

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`，末尾是收到的值。

## 示例

```js
const flat = CATransform3D.rotation(Math.PI / 6, 0, 0, 1);
const same = CATransform3D.fromAffineTransform(CGAffineTransform.rotation(Math.PI / 6));
console.log(Math.abs(flat.m12 - same.m12) < 1e-9);

const tilt = CATransform3D.rotation(Math.PI / 2, 1, 0, 0);
console.log(Math.round(tilt.m21), Math.round(tilt.m22), Math.round(tilt.m23));
```

**结果**

- 第一行输出 `true`：绕 z 轴转和二维的旋转是同一个变换。
- 第二行输出 `0 0 1`：绕 x 轴转 90° 后，原来的 y 轴指向 z 轴。

```js
const card = new CALayer();
card.transform = CATransform3D.rotation(Math.PI / 4, 0, 1, 0);
```

**效果**：图层绕竖直的中线转 45°。没有透视，所以屏幕上只是横向变窄；要有近大远小，见[透视](../ca-transform-3d.md#透视)。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

`CATransform3DMakeRotation(angle, x, y, z)`。转轴是零向量时 ObjC 的结果没有定义，这里抛 `RangeError`。

## 参见

- [`rotate()`](rotate.md)：在已有的变换前面加一步旋转
- [透视](../ca-transform-3d.md#透视)
- [单位](../units.md)：弧度和角度
- [结构体](../structs.md)：所有结构体共同的规则
