---
type: reference
native: "-[NSLayoutDimension constraintLessThanOrEqualToConstant:]"
---

# `NSLayoutDimension`：`constraintLessThanOrEqualToConstant()` 方法

**`constraintLessThanOrEqualToConstant()`** 方法创建一条约束：这个尺寸小于或等于一个常数（这个尺寸 ≤ `value`）。

## 语法

```
constraintLessThanOrEqualToConstant(value)
```

### 参数

**`value`**

数，单位 [pt](../units.md)。按 `Number()` 转换。

### 返回值

新的 [`NSLayoutConstraint`](../auto-layout.md)。**它还没有激活**，要用 [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) 或 [`isActive`](../auto-layout/isactive.md) 激活之后才参与布局。约束的 [`secondAnchor`](../auto-layout/secondanchor.md) 是 `null`，[`secondAttribute`](../auto-layout/secondattribute.md) 是 `'notAnAttribute'`。

### 异常

**`TypeError`**

`value` 转不成有限数：`constant must be a finite number, got "abc"`。

## 示例

```js
const box = new UIView();
const c = box.widthAnchor.constraintLessThanOrEqualToConstant(300);
c.isActive = true;
console.log(c.relation, c.constant, c.secondAnchor);
```

**结果**：`box` 的宽不大于 300 pt。控制台输出 `lessThanOrEqual 300 null`。

## 对应的 iOS API

`-[NSLayoutDimension constraintLessThanOrEqualToConstant:]`。

## 参见

- [`constraintEqualToConstant()`](constraintequaltoconstant.md)
- [`constraintGreaterThanOrEqualToConstant()`](constraintgreaterthanorequaltoconstant.md)
- [`constraintLessThanOrEqualToAnchor()`](constraintlessthanorequaltoanchor.md)：和另一个尺寸比
