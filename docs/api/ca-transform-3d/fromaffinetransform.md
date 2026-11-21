---
type: reference
native: CATransform3DMakeAffineTransform
---

# `CATransform3D.fromAffineTransform()` 静态方法

**`CATransform3D.fromAffineTransform()`** 静态方法把一个二维的 [`CGAffineTransform`](../cg-affine-transform.md) 变成效果相同的三维变换。

## 语法

```
CATransform3D.fromAffineTransform(transform)
```

### 参数

**`transform`**

一个 `CGAffineTransform`，或者带 `a`、`b`、`c`、`d`、`tx`、`ty` 六个字段的普通对象。

### 返回值

新的 `CATransform3D`。六个数放到对应的位置，z 方向不变：

| `CGAffineTransform` 的字段 | 放到 |
| --- | --- |
| `a` | `m11` |
| `b` | `m12` |
| `c` | `m21` |
| `d` | `m22` |
| `tx` | `m41` |
| `ty` | `m42` |

`m33` 和 `m44` 是 1，其余是 0。反过来取二维的部分用 [`affineTransform`](affinetransform.md)。

### 异常

**`TypeError`**

- `transform` 不是对象：`fromAffineTransform needs an object with all of: a, b, c, d, tx, ty`。
- `transform` 少字段，或者字段转不成有限的数：`fromAffineTransform is missing tx, or it is not a finite number`，中间是缺的字段名。

## 示例

```js
const flat = new CGAffineTransform(1, 2, 3, 4, 5, 6);
const t = CATransform3D.fromAffineTransform(flat);
console.log(t.m11, t.m12, t.m21, t.m22, t.m41, t.m42, t.m33, t.m44);
```

**结果**：输出 `1 2 3 4 5 6 1 1`。

## 对应的 iOS API

`CATransform3DMakeAffineTransform(m)`。

## 参见

- [`affineTransform`](affinetransform.md)：反过来，取三维变换里二维的部分
- [`CGAffineTransform`](../cg-affine-transform.md)
- [结构体](../structs.md)：所有结构体共同的规则
