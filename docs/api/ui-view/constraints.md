---
type: reference
native: UIView.constraints
---

# `UIView`：`constraints` 属性

**`constraints`** 属性是存放在这个视图上的约束。

## 值

[`NSLayoutConstraint`](../auto-layout.md) 的只读数组。

- 只读。给它赋值抛 `TypeError`。
- 它不等于「影响这个视图的约束」。激活时，系统把约束存放到两端视图最近的共同祖先上：两个子视图之间的约束存放在它们的父视图上；视图自己的宽高约束（约束到常数）存放在它自己身上。
- 要查影响这个视图的全部约束，用 [`constraintsAffectingLayoutForAxis()`](constraintsaffectinglayoutforaxis.md)。

## 示例

```js
const card = new UIView();
const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
cardHeight.isActive = true;
console.log(card.constraints.includes(cardHeight));
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIView.constraints`。原生的 `[view addConstraint:c]` 和 `[view removeConstraint:c]` 没有对应的 JS 方法，用约束的 `isActive`。

## 参见

- [创建和激活是两步](../auto-layout.md#创建和激活是两步)
