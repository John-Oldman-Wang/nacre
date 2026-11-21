---
type: reference
native: CATransform3D
---

# `CATransform3D`

**`CATransform3D`** 表示一个三维变换：沿 x、y、z 三个方向的缩放、旋转、平移，透视，以及它们的组合。[`CALayer`](ca-layer.md) 的 [`transform`](ca-layer/transform.md) 和 [`sublayerTransform`](ca-layer/sublayertransform.md) 属性的值是它。

坐标轴的方向：x 向右，y 向下，z 垂直于屏幕、指向看屏幕的人。

16 个字段是下面这个 4 × 4 矩阵里的 16 个数，`m` 后面第一位是行，第二位是列：

```
| m11 m12 m13 m14 |
| m21 m22 m23 m24 |
| m31 m32 m33 m34 |
| m41 m42 m43 m44 |
```

变换一个点 (x, y, z) 时，把它写成一行 `[x y z 1]`，乘在矩阵的左边：

```
x' = x * m11 + y * m21 + z * m31 + m41
y' = x * m12 + y * m22 + z * m32 + m42
z' = x * m13 + y * m23 + z * m33 + m43
w' = x * m14 + y * m24 + z * m34 + m44
```

点最后落在 (x' / w', y' / w', z' / w')。所以平移量在第四行（`m41`、`m42`、`m43`，单位 [pt](units.md)），透视用的数在第四列（最常用的是 `m34`）。字段的排法和 ObjC 的 `CATransform3D` 一样，ObjC 代码里的 `m34` 和这里的 `m34` 是同一个数。按列向量写的数学资料里，矩阵是这里的转置，平移量在第四列。

日常使用不需要直接填这 16 个数：用静态方法造出基本变换，再用 [`concat()`](ca-transform-3d/concat.md) 组合。透视要直接写 `m34`，见[透视](#透视)。

字段只读，要改就整体换一个新的；写入图层的 `transform` 时也可以给字段齐全的普通对象；每次读属性得到一个新对象。这几条对所有结构体都成立，见[结构体](structs.md)。变换的方法都在 JS 里计算，返回新的对象，不改调用者。

**继承关系**：没有。`CATransform3D` 是普通的 JS 类，不继承 `NSObject`，也不是 `EventTarget`。

## 构造函数

[`CATransform3D()`](ca-transform-3d/constructor.md)

直接给出矩阵的 16 个数。不给的参数是 0，所以 `new CATransform3D()` 不是单位矩阵。

## 静态属性

[`CATransform3D.identity`](ca-transform-3d/identity.md)

单位矩阵，表示不做任何变换。每次读得到一个新的实例。

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`CATransform3D.translation()`](ca-transform-3d/translation.md) | 平移，单位 pt |
| [`CATransform3D.scale()`](ca-transform-3d/scale-static.md) | 缩放。只给一个参数时 x、y 两个方向相同 |
| [`CATransform3D.rotation()`](ca-transform-3d/rotation.md) | 绕一根轴旋转，参数是弧度 |
| [`CATransform3D.fromAffineTransform()`](ca-transform-3d/fromaffinetransform.md) | 把二维的 [`CGAffineTransform`](cg-affine-transform.md) 变成三维的 |

## 实例属性

矩阵的 16 个数：

| 属性 | 说明 |
| --- | --- |
| [`m11`](ca-transform-3d/m11.md) <small>只读</small> | 第一行第一列。只有缩放时是 x 方向的倍数 |
| [`m12`](ca-transform-3d/m12.md) <small>只读</small> | 第一行第二列 |
| [`m13`](ca-transform-3d/m13.md) <small>只读</small> | 第一行第三列 |
| [`m14`](ca-transform-3d/m14.md) <small>只读</small> | 第一行第四列，透视用 |
| [`m21`](ca-transform-3d/m21.md) <small>只读</small> | 第二行第一列 |
| [`m22`](ca-transform-3d/m22.md) <small>只读</small> | 第二行第二列。只有缩放时是 y 方向的倍数 |
| [`m23`](ca-transform-3d/m23.md) <small>只读</small> | 第二行第三列 |
| [`m24`](ca-transform-3d/m24.md) <small>只读</small> | 第二行第四列，透视用 |
| [`m31`](ca-transform-3d/m31.md) <small>只读</small> | 第三行第一列 |
| [`m32`](ca-transform-3d/m32.md) <small>只读</small> | 第三行第二列 |
| [`m33`](ca-transform-3d/m33.md) <small>只读</small> | 第三行第三列。只有缩放时是 z 方向的倍数 |
| [`m34`](ca-transform-3d/m34.md) <small>只读</small> | 第三行第四列，透视用 |
| [`m41`](ca-transform-3d/m41.md) <small>只读</small> | x 方向的平移量，pt |
| [`m42`](ca-transform-3d/m42.md) <small>只读</small> | y 方向的平移量，pt |
| [`m43`](ca-transform-3d/m43.md) <small>只读</small> | z 方向的平移量，pt |
| [`m44`](ca-transform-3d/m44.md) <small>只读</small> | 第四行第四列，一般是 1 |

由这 16 个数算出来的：

| 属性 | 说明 |
| --- | --- |
| [`isIdentity`](ca-transform-3d/isidentity.md) <small>只读</small> | 是不是单位矩阵 |
| [`isAffine`](ca-transform-3d/isaffine.md) <small>只读</small> | 能不能用二维的 `CGAffineTransform` 表示 |
| [`affineTransform`](ca-transform-3d/affinetransform.md) <small>只读</small> | 二维的那一部分，`CGAffineTransform` |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`concat()`](ca-transform-3d/concat.md) | 和另一个变换组合：先做自己，再做另一个 |
| [`translate()`](ca-transform-3d/translate.md) | 先平移，再做自己 |
| [`scale()`](ca-transform-3d/scale.md) | 先缩放，再做自己 |
| [`rotate()`](ca-transform-3d/rotate.md) | 先旋转，再做自己 |
| [`invert()`](ca-transform-3d/invert.md) | 逆变换。不可逆时返回 `null` |
| [`toString()`](ca-transform-3d/tostring.md) | 写成 `CATransform3D(m11, m12, …, m44)` |

## 组合的顺序

`a.concat(b)` 先做 `a`，再做 `b`。两种顺序得到的结果不同：

```js
const move = CATransform3D.translation(10, 0, 0);
const grow = CATransform3D.scale(2);

console.log(move.concat(grow).m41);
console.log(grow.concat(move).m41);
```

**结果**

- 第一行输出 `20`：先平移再缩放，平移量也放大了 2 倍。
- 第二行输出 `10`：先缩放再平移，平移量不受缩放影响。

`translate()`、`scale()`、`rotate()` 三个实例方法把新的一步放在**前面**：`t.rotate(...)` 等于 `CATransform3D.rotation(...).concat(t)`，先旋转，再做 `t`。这和 ObjC 的 `CATransform3DRotate(t, ...)` 一致。

## 透视

没有透视时 w' 一直是 1，离得远的点不会变小。所以一个绕 y 轴转了 45° 的图层，屏幕上只是横向变窄。**屏幕上的样子未在模拟器验证。**

要有近大远小，把 `m34` 设成 `-1 / d`。`d` 是看的人到屏幕平面的距离，单位 pt。`d` 越小，透视越明显。写进图层时可以直接给普通对象：

```js
const layer = new CALayer();
layer.transform = { ...CATransform3D.identity, m34: -1 / 500 };
console.log(layer.transform.m34);
```

**结果**：输出 `-0.002`。

透视要放在旋转**之后**。图层本来是平的，所有点的 z 都是 0；先做透视时 `z * m34` 这一项是 0，什么都不变。先用构造函数造出带透视的矩阵，再调 [`rotate()`](ca-transform-3d/rotate.md)，就是先旋转、再透视：

```js
const perspective = new CATransform3D(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, -1 / 500,
  0, 0, 0, 1);

const card = new CALayer();
card.transform = perspective.rotate(Math.PI / 4, 0, 1, 0);
```

**效果**：图层绕自己竖直的中线转 45°，转向屏幕里面的一侧变小，转出来的一侧变大。**屏幕上的样子未在模拟器验证。**

一组图层要共用一个透视时，把 `m34` 写在它们父图层的 [`sublayerTransform`](ca-layer/sublayertransform.md) 上，每个子图层的 `transform` 只写旋转。

## 示例

从空白 App 开始，把一张卡片绕竖直的中线转 45°，带透视。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const card = new UIView();
  card.frame = new CGRect(60, 160, 200, 120);
  card.backgroundColor = 'systemIndigo';
  card.layer.cornerRadius = 16;
  page.view.addSubview(card);

  const perspective = new CATransform3D(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, -1 / 500,
    0, 0, 0, 1);
  card.layer.transform = perspective.rotate(Math.PI / 4, 0, 1, 0);

  console.log(card.layer.transform.isAffine);
});
```

**效果**

- 屏幕上有一张 200 × 120 pt 的紫色卡片，绕竖直的中线转了 45°，一侧近一侧远。**屏幕上的样子未在模拟器验证。**
- 控制台输出 `false`：带透视的变换不能用二维的 `CGAffineTransform` 表示。

带小数的字段写进图层再读回来，验收用例按 1e-9 的误差比较，在这个误差以内相同；逐位相等**未在模拟器验证**。比较时留出容差：

```js
const layer = new CALayer();
const turn = CATransform3D.rotation(0.5, 0, 1, 0);
layer.transform = turn;
console.log(Math.abs(layer.transform.m11 - turn.m11) < 1e-9);
```

**结果**：输出 `true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `CATransform3DIdentity` | `CATransform3D.identity` |
| `CATransform3DMakeTranslation(tx, ty, tz)` | `CATransform3D.translation(tx, ty, tz)` |
| `CATransform3DMakeScale(sx, sy, sz)` | `CATransform3D.scale(sx, sy, sz)` |
| `CATransform3DMakeRotation(angle, x, y, z)` | `CATransform3D.rotation(angle, x, y, z)` |
| `CATransform3DMakeAffineTransform(m)` | `CATransform3D.fromAffineTransform(m)` |
| `CATransform3DConcat(a, b)` | `a.concat(b)` |
| `CATransform3DTranslate(t, tx, ty, tz)` | `t.translate(tx, ty, tz)` |
| `CATransform3DScale(t, sx, sy, sz)` | `t.scale(sx, sy, sz)` |
| `CATransform3DRotate(t, angle, x, y, z)` | `t.rotate(angle, x, y, z)` |
| `CATransform3DInvert(t)`（不可逆时返回 `t` 本身） | `t.invert()`（不可逆时返回 `null`） |
| `CATransform3DIsIdentity(t)` | `t.isIdentity` |
| `CATransform3DIsAffine(t)` | `t.isAffine` |
| `CATransform3DGetAffineTransform(t)` | `t.affineTransform` |
| `t.m34 = -1.0 / 500`（改结构体的一个字段） | `{ ...t, m34: -1 / 500 }`（造一个新的普通对象） |

## 参见

- [`CALayer.transform`](ca-layer/transform.md)：图层的三维变换
- [`CALayer.sublayerTransform`](ca-layer/sublayertransform.md)：给一组子图层共同的透视
- [`CAPropertyAnimation`](ca-property-animation.md#能做动画的属性)：给变换做动画的 `keyPath`
- [`CGAffineTransform`](cg-affine-transform.md)：视图用的二维变换
- [结构体](structs.md)：所有结构体共同的规则
- [单位](units.md)：pt、弧度和角度
