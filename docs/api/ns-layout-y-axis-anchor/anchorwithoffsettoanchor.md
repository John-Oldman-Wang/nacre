---
type: reference
native: "-[NSLayoutYAxisAnchor anchorWithOffsetToAnchor:]"
---

# `NSLayoutYAxisAnchor`：`anchorWithOffsetToAnchor()` 方法

**`anchorWithOffsetToAnchor()`** 方法返回一个尺寸锚点，代表从这个锚点到 `other` 的距离。

返回的锚点可以像 `widthAnchor` 一样建约束。用途是让两段间隔相等，或者让一段间隔等于某个尺寸。

## 语法

```
anchorWithOffsetToAnchor(other)
```

### 参数

**`other`**

另一个 `NSLayoutYAxisAnchor`。

### 返回值

[`NSLayoutDimension`](../ns-layout-dimension.md)，代表两个锚点之间的距离。

### 异常

**`TypeError`**

`other` 是另一种类型的锚点，或者不是锚点。报错信息和 [`constraintEqualToAnchor()`](../ns-layout-anchor/constraintequaltoanchor.md) 相同。**这一条未在模拟器验证。**

## 示例

```js
const parent = new UIView();
const left = new UIView();
const middle = new UIView();
const right = new UIView();
for (const v of [left, middle, right]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const gapA = left.bottomAnchor.anchorWithOffsetToAnchor(middle.topAnchor);
const gapB = middle.bottomAnchor.anchorWithOffsetToAnchor(right.topAnchor);
gapA.constraintEqualToAnchor(gapB).isActive = true;
```

**效果**：`left` 到 `middle` 的间隔等于 `middle` 到 `right` 的间隔。**未在模拟器验证。**

## 对应的 iOS API

`-[NSLayoutYAxisAnchor anchorWithOffsetToAnchor:]`。

## 参见

- [`NSLayoutDimension`](../ns-layout-dimension.md)：返回值能建的约束
