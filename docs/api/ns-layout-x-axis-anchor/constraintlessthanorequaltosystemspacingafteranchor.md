---
type: reference
native: "-[NSLayoutXAxisAnchor constraintLessThanOrEqualToSystemSpacingAfterAnchor:multiplier:]"
---

# `NSLayoutXAxisAnchor`：`constraintLessThanOrEqualToSystemSpacingAfterAnchor()` 方法

**`constraintLessThanOrEqualToSystemSpacingAfterAnchor()`** 方法创建一条约束：这个锚点在 `other` 之后（从左往右的语言里是右侧），两者的距离小于或等于系统标准间距乘以 `multiplier`。

标准间距是系统规定的间距，不写具体的数。它的数值由系统决定，和两端是什么有关。具体数值**未在模拟器验证**。

## 语法

```
constraintLessThanOrEqualToSystemSpacingAfterAnchor(other[, { multiplier }])
```

### 参数

**`other`**

另一个 `NSLayoutXAxisAnchor`。

**`options.multiplier`**

数，比例，没有单位。可省略，省略时是 `1`。

### 返回值

新的 [`NSLayoutConstraint`](../auto-layout.md)。**它还没有激活**，要用 [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) 或 [`isActive`](../auto-layout/isactive.md) 激活之后才参与布局。

### 异常

**`TypeError`**

- `other` 是另一种类型的锚点，或者不是锚点：和 [`constraintEqualToAnchor()`](../ns-layout-anchor/constraintequaltoanchor.md) 相同。
- `multiplier` 转不成有限数：`multiplier must be a finite number, got "abc"`。

## 示例

```js
const parent = new UIView();
const a = new UIView();
const b = new UIView();
for (const v of [a, b]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const next = b.leadingAnchor.constraintLessThanOrEqualToSystemSpacingAfterAnchor(a.trailingAnchor);
next.isActive = true;
```

**效果**：`b` 排在 `a` 之后（从左往右的语言里是右侧），中间的距离最多是一段系统标准间距。**未在模拟器验证。**

## 对应的 iOS API

`-[NSLayoutXAxisAnchor constraintLessThanOrEqualToSystemSpacingAfterAnchor:multiplier:]`。ObjC 里 `multiplier:` 必须给，这里可以省略。

## 参见

- [`constraintEqualToSystemSpacingAfterAnchor()`](constraintequaltosystemspacingafteranchor.md)
- [`constraintGreaterThanOrEqualToSystemSpacingAfterAnchor()`](constraintgreaterthanorequaltosystemspacingafteranchor.md)
- [`anchorWithOffsetToAnchor()`](anchorwithoffsettoanchor.md)
