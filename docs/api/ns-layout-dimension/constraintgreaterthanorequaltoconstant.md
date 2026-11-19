---
type: reference
native: "-[NSLayoutDimension constraintGreaterThanOrEqualToConstant:]"
---

# `NSLayoutDimension`：`constraintGreaterThanOrEqualToConstant()` 方法

**`constraintGreaterThanOrEqualToConstant()`** 方法创建一条约束：这个尺寸大于或等于一个常数（这个尺寸 ≥ `value`）。

## 语法

```
constraintGreaterThanOrEqualToConstant(value)
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
const c = box.widthAnchor.constraintGreaterThanOrEqualToConstant(100);
c.isActive = true;
console.log(c.relation, c.constant, c.secondAnchor);
```

**结果**：`box` 的宽不小于 100 pt。控制台输出 `greaterThanOrEqual 100 null`。

## 对应的 iOS API

`-[NSLayoutDimension constraintGreaterThanOrEqualToConstant:]`。

## 参见

- [`constraintEqualToConstant()`](constraintequaltoconstant.md)
- [`constraintLessThanOrEqualToConstant()`](constraintlessthanorequaltoconstant.md)
- [`constraintGreaterThanOrEqualToAnchor()`](constraintgreaterthanorequaltoanchor.md)：和另一个尺寸比
