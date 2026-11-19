---
type: reference
native: NSLayoutConstraint.multiplier
---

# `NSLayoutConstraint`：`multiplier` 属性

**`multiplier`** 属性是约束等式里的倍数（`第一个锚点 = 第二个锚点 × multiplier + constant`）。

## 值

数，比例，没有单位。

- 只读。给它赋值抛 `TypeError`。约束建好之后倍数不能改，要换倍数就换一条约束，见[停用和替换约束](../../guides/auto-layout.md#停用和替换约束)。
- 值是创建约束时传入的 `multiplier`，没传是 `1`。只有尺寸锚点之间的约束能带倍数。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const half = box.widthAnchor.constraintEqualToAnchor(parent.widthAnchor, { multiplier: 0.5 });
console.log(half.multiplier);
```

**结果**：输出 `0.5`。

## 对应的 iOS API

`NSLayoutConstraint.multiplier`。

## 参见

- [`NSLayoutDimension.constraintEqualToAnchor()`](../ns-layout-dimension/constraintequaltoanchor.md)
