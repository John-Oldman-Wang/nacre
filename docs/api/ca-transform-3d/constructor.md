---
type: reference
native: CATransform3D
---

# `CATransform3D()` 构造函数

**`CATransform3D()`** 构造函数直接给出矩阵的 16 个数，创建一个变换。

日常不需要直接填这 16 个数：用 [`translation()`](translation.md)、[`scale()`](scale-static.md)、[`rotation()`](rotation.md) 造出基本变换，再用 [`concat()`](concat.md) 组合。要写透视（`m34`），或者这几个方法组合不出需要的变换时，才用构造函数。

## 语法

```
new CATransform3D()
new CATransform3D(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44)
```

### 参数

**`m11`** … **`m44`**

矩阵里的 16 个数，按行的顺序给出：先第一行的四个，再第二行，依此类推。位置如下：

```
| m11 m12 m13 m14 |
| m21 m22 m23 m24 |
| m31 m32 m33 m34 |
| m41 m42 m43 m44 |
```

`m41`、`m42`、`m43` 是平移量，单位 [pt](../units.md)；`m14`、`m24`、`m34` 是透视用的数，单位是 pt 的倒数；其余是比例，没有单位。

每个参数都可以不给。给了的按数转换；不给的是 0，所以 `new CATransform3D()` 得到的是 16 个 0，不是单位矩阵；单位矩阵用 [`CATransform3D.identity`](identity.md)。

### 返回值

新建的 `CATransform3D`。字段只读。

### 异常

**`TypeError`**

某个参数转不成有限的数：`a struct field must be a finite number, got "x"`，末尾是收到的值。

## 示例

```js
const perspective = new CATransform3D(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, -1 / 500,
  0, 0, 0, 1);
console.log(String(perspective));
console.log(new CATransform3D().isIdentity);
```

**结果**

- 第一行输出 `CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -0.002, 0, 0, 0, 1)`：单位矩阵加上 `m34` 的透视。
- 第二行输出 `false`：不给参数时 16 个数都是 0。

## 对应的 iOS API

ObjC 里没有构造函数，直接写结构体的字段：`CATransform3D t = { 1, 0, 0, 0, … }`，或者从 `CATransform3DIdentity` 开始改某个字段。

## 参见

- [`CATransform3D.identity`](identity.md)：单位矩阵
- [透视](../ca-transform-3d.md#透视)
- [结构体](../structs.md)：所有结构体共同的规则
