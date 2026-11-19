---
type: reference
native: UIView.hasAmbiguousLayout
---

# `UIView`：`hasAmbiguousLayout` 属性

**`hasAmbiguousLayout`** 属性表示这个视图的约束够不够：位置和大小是否被约束唯一确定。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 约束不够，这个视图的位置或大小有多种可能的结果 |
| `false` | 结果唯一 |

- 只读。给它赋值抛 `TypeError`。
- 先调 [`layoutIfNeeded()`](layoutifneeded.md) 再读。
- 验收用例断言过结果唯一时是 `false`；`true` 的情况**未在模拟器验证**。

约束不够或冲突时，系统不在控制台输出任何信息（实测：标准输出、标准错误、系统日志都没有内容）。用 [`hasAmbiguousLayout`](hasambiguouslayout.md)、[`exerciseAmbiguityInLayout()`](exerciseambiguityinlayout.md)、[`constraintsAffectingLayoutForAxis()`](constraintsaffectinglayoutforaxis.md) 检查。

## 示例

```js
const page = new UIView();
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.addSubview(card);
NSLayoutConstraint.activateConstraints([
  card.leadingAnchor.constraintEqualToAnchor(page.leadingAnchor),
  card.topAnchor.constraintEqualToAnchor(page.topAnchor),
  card.widthAnchor.constraintEqualToConstant(100),
  card.heightAnchor.constraintEqualToConstant(60),
]);
page.layoutIfNeeded();
console.log(card.hasAmbiguousLayout);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIView.hasAmbiguousLayout`。

## 参见

- [约束不够和约束冲突](../auto-layout.md#约束不够和约束冲突)
- [查约束够不够](../../guides/auto-layout.md#查约束够不够)
