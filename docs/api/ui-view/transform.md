---
type: reference
native: UIView.transform
---

# `UIView`：`transform` 属性

**`transform`** 属性是视图的二维仿射变换：平移、缩放、旋转以及它们的组合。

## 值

[`CGAffineTransform`](../cg-affine-transform.md)。

- 可读，可写。
- 默认值是单位矩阵（`isIdentity` 是 `true`）。设回 [`CGAffineTransform.identity`](../cg-affine-transform/identity.md) 恢复原样。
- 变换以视图的中心为原点，只改变画出来的样子，不改变 [`bounds`](bounds.md) 和 [`center`](center.md)。
- 每次赋值替换之前的变换，不累加。
- 写入时可以给 `CGAffineTransform`，也可以给六个字段（`a`、`b`、`c`、`d`、`tx`、`ty`）齐全的普通对象。读出来的结构体字段只读，每次读得到一个新对象，见[结构体](../structs.md)。
- 带小数的字段读回来可能在末尾几位上不同，比较时留出容差。
- 能带动画，见 [`UIView.animateWithDuration()`](animatewithduration.md)。

> **注意**：`transform` 不是单位矩阵时，[`frame`](frame.md) 读出来的是变换后图形的外接矩形，不再是视图原本的矩形。这时要改位置用 `center`，要改大小用 `bounds`，不读写 `frame`。把 `transform` 设回单位矩阵之后，`frame` 恢复。

### 写错时

- 给的不是对象：抛 `TypeError: transform needs an object with all of: a, b, c, d, tx, ty`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: transform is missing …, or it is not a finite number`，中间是缺的字段名。
- 出错时属性保持原值。字段的值按 `Number()` 转换，所以 `'10'` 可以。

## 示例

```js
const box = new UIView();
box.frame = new CGRect(24, 304, 40, 40);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));

console.log(box.bounds.width);
console.log(box.center.x);
console.log(box.frame.width);

box.transform = CGAffineTransform.identity;
console.log(box.frame.width);
```

**效果**

- 方块以自己的中心为轴，放大到 1.2 倍，并顺时针旋转 30°。
- 依次输出 `40`（`bounds` 不变）、`44`（`center` 不变）、约 `65.57`（等于 40 × (|a| + |c|)，a 和 c 是变换矩阵的字段）。
- 设回单位矩阵之后输出 `40`。

## 对应的 iOS API

`UIView.transform`。`CGAffineTransformMakeRotation(a)` 写成 `CGAffineTransform.rotation(a)`。

## 参见

- [`CGAffineTransform`](../cg-affine-transform.md)
- [变换和 `frame`](../ui-view.md#变换和-frame)
