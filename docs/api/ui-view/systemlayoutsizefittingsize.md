---
type: reference
native: "-[UIView systemLayoutSizeFittingSize:]"
---

# `UIView`：`systemLayoutSizeFittingSize()` 方法

**`systemLayoutSizeFittingSize()`** 方法按这个视图和它的后代上的约束，算出最接近 `size` 的尺寸。它不实际改变布局。

## 语法

```
systemLayoutSizeFittingSize(size)
systemLayoutSizeFittingSize(size, { withHorizontalFittingPriority, verticalFittingPriority })
```

### 参数

**`size`**

[`CGSize`](../cg-size.md) 或 `{ width, height }`，单位 [pt](../units.md)。传 `new CGSize(0, 0)` 表示求满足约束的最小尺寸。

**`options.withHorizontalFittingPriority`**、**`options.verticalFittingPriority`**

数或优先级的名字（`'required'`（1000）、`'defaultHigh'`（750）、`'dragThatCanResizeScene'`（510）、`'sceneSizeStayPut'`（500）、`'dragThatCannotResizeScene'`（490）、`'defaultLow'`（250）、`'fittingSizeLevel'`（50）），两个要一起传。`'required'` 表示这个方向必须正好等于 `size` 里的值，`'fittingSizeLevel'` 表示这个方向尽量小。常见用法是固定宽度、求高度：`{ withHorizontalFittingPriority: 'required', verticalFittingPriority: 'fittingSizeLevel' }`。带优先级的版本**未在模拟器验证**。

### 返回值

`CGSize`，单位 pt。

### 异常

**`TypeError`**

- `size` 不是对象：`systemLayoutSizeFittingSize needs an object with all of: width, height`。
- `size` 缺字段或字段不是有限的数：`systemLayoutSizeFittingSize is missing width, or it is not a finite number`。
- 优先级的名字写错：`withHorizontalFittingPriority has no value "x"; expected one of: …`。

## 说明

和 [`sizeThatFits()`](sizethatfits.md) 的区别：`sizeThatFits()` 问的是视图自己的内容需要多大，这个方法按子视图之间的约束来算。

## 示例

```js
const card = new UIView();
const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
cardHeight.isActive = true;

const fitted = card.systemLayoutSizeFittingSize(new CGSize(0, 0));
console.log(fitted.height);
```

**结果**：输出 `60`，就是 `cardHeight` 约束的值。

## 对应的 iOS API

`-[UIView systemLayoutSizeFittingSize:]` 和 `systemLayoutSizeFittingSize:withHorizontalFittingPriority:verticalFittingPriority:` 在 JS 里是同一个方法。

## 参见

- [`sizeThatFits()`](sizethatfits.md)
