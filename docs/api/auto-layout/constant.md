---
type: reference
native: NSLayoutConstraint.constant
---

# `NSLayoutConstraint`：`constant` 属性

**`constant`** 属性是约束等式里的常数项（`第一个锚点 = 第二个锚点 × multiplier + constant`）。它是约束创建之后唯一能改的数值。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是创建约束时传入的 `constant`，没传是 `0`。约束到常数的约束（[`constraintEqualToConstant()`](../ns-layout-dimension/constraintequaltoconstant.md) 这一类），它是那个常数。
- 水平方向向右为正，垂直方向向下为正。
- 改了之后在下一次布局时生效。要立刻读到新的 `frame`，先调 [`layoutIfNeeded()`](../ui-view/layoutifneeded.md)。变化是立刻完成的，没有过渡动画；要动画，见指南[让视图动起来](../../guides/view-animations.md)。
- 接受能转成数的值，`'84'` 和 `84` 效果相同。
- 没有变化通知。只有 App 自己的代码会改它。

### 写错时

写入转不成有限数的值（`undefined`、`'abc'`、`NaN`）：抛 `TypeError: constant must be a finite number, got undefined`，末尾是收到的值。`constant` 保持原来的值。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const height = box.heightAnchor.constraintEqualToConstant(60);
height.isActive = true;
parent.layoutIfNeeded();

height.constant = 84;
parent.layoutIfNeeded();
console.log(box.frame.height);
```

**结果**：输出 `84`。

## 对应的 iOS API

`NSLayoutConstraint.constant`。

## 参见

- [展开和收起](../../guides/auto-layout.md#之后修改约束的常数展开和收起)
- [`multiplier`](multiplier.md)：建好之后不能改
