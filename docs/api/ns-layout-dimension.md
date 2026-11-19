---
type: reference
native: NSLayoutDimension
---

# `NSLayoutDimension`

**`NSLayoutDimension`** 表示尺寸锚点：视图或 layout guide 的 `widthAnchor` 和 `heightAnchor`，以及 [`anchorWithOffsetToAnchor()`](ns-layout-x-axis-anchor/anchorwithoffsettoanchor.md) 返回的两个锚点之间的距离。

尺寸锚点能做两件位置锚点做不到的事：和一个常数比（「宽 = 120 pt」），以及带倍数（「宽 = 父视图的宽 × 0.5」）。宽和高是同一种类型，可以互相约束。

**继承关系**：`EventTarget` → `NSObject` → [`NSLayoutAnchor`](ns-layout-anchor.md) → `NSLayoutDimension`

## 构造函数

不能用 `new` 创建。从视图或 [`UILayoutGuide`](ui-layout-guide.md) 的 `widthAnchor`、`heightAnchor` 上读。

## 实例方法

和常数比：

| 方法 | 得到的约束 |
| --- | --- |
| [`constraintEqualToConstant()`](ns-layout-dimension/constraintequaltoconstant.md) | 这个尺寸 = `value` |
| [`constraintGreaterThanOrEqualToConstant()`](ns-layout-dimension/constraintgreaterthanorequaltoconstant.md) | 这个尺寸 ≥ `value` |
| [`constraintLessThanOrEqualToConstant()`](ns-layout-dimension/constraintlessthanorequaltoconstant.md) | 这个尺寸 ≤ `value` |

和另一个尺寸比，可以带倍数。这三个方法覆盖了 [`NSLayoutAnchor`](ns-layout-anchor.md) 上的同名方法：

| 方法 | 得到的约束 |
| --- | --- |
| [`constraintEqualToAnchor()`](ns-layout-dimension/constraintequaltoanchor.md) | 这个尺寸 = `other` × `multiplier` + `constant` |
| [`constraintGreaterThanOrEqualToAnchor()`](ns-layout-dimension/constraintgreaterthanorequaltoanchor.md) | 这个尺寸 ≥ `other` × `multiplier` + `constant` |
| [`constraintLessThanOrEqualToAnchor()`](ns-layout-dimension/constraintlessthanorequaltoanchor.md) | 这个尺寸 ≤ `other` × `multiplier` + `constant` |

## 示例

```js
const parent = new UIView();
const cover = new UIView();
cover.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(cover);

NSLayoutConstraint.activateConstraints([
  cover.widthAnchor.constraintEqualToAnchor(parent.widthAnchor, { multiplier: 0.5 }),
  cover.heightAnchor.constraintEqualToAnchor(cover.widthAnchor, { multiplier: 9 / 16 }),
]);
```

**效果**：`cover` 的宽是 `parent` 的一半，高是宽的 9/16。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[v.widthAnchor constraintEqualToConstant:60]` | `v.widthAnchor.constraintEqualToConstant(60)` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5 })` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5 constant:-8]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5, constant: -8 })` |

## 参见

- [`NSLayoutAnchor`](ns-layout-anchor.md)
- [`NSLayoutConstraint`](auto-layout.md)
- [宽度是父视图的一半](../guides/auto-layout.md#宽度是父视图的一半)、[保持宽高比](../guides/auto-layout.md#保持宽高比)
