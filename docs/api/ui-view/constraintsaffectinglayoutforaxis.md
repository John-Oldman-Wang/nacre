---
type: reference
native: "-[UIView constraintsAffectingLayoutForAxis:]"
---

# `UIView`：`constraintsAffectingLayoutForAxis()` 方法

**`constraintsAffectingLayoutForAxis()`** 方法返回在一个方向上实际影响这个视图的所有约束，包括存放在祖先上的。

## 语法

```
constraintsAffectingLayoutForAxis(axis)
```

### 参数

**`axis`**

`'horizontal'` 或 `'vertical'`。

### 返回值

[`NSLayoutConstraint`](../auto-layout.md) 的只读数组。

### 异常

**`TypeError`**

方向写错：`axis has no value "diagonal"; expected one of: horizontal / vertical`。

## 说明

约束不够或冲突时，系统不在控制台输出任何信息（实测：标准输出、标准错误、系统日志都没有内容）。用 [`hasAmbiguousLayout`](hasambiguouslayout.md)、[`exerciseAmbiguityInLayout()`](exerciseambiguityinlayout.md)、[`constraintsAffectingLayoutForAxis()`](constraintsaffectinglayoutforaxis.md) 检查。

## 示例

```js
const page = new UIView();
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.addSubview(card);
const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
cardHeight.identifier = 'card-height';
NSLayoutConstraint.activateConstraints([
  cardHeight,
  card.topAnchor.constraintEqualToAnchor(page.topAnchor),
]);
page.layoutIfNeeded();

for (const c of card.constraintsAffectingLayoutForAxis('vertical')) {
  console.log(c.identifier, c.firstAttribute, c.relation, c.constant, c.priority);
}
```

**结果**：每行输出一条在垂直方向上影响 `card` 的约束。其中一行是 `card-height height equal 60 1000`。循环输出的具体内容**未在模拟器验证**。

## 对应的 iOS API

`-[UIView constraintsAffectingLayoutForAxis:]`。

## 参见

- [`identifier`](../auto-layout/identifier.md)：给约束起名字，输出时认得出来
- [`constraints`](constraints.md)
