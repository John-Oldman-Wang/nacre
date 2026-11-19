---
type: reference
native: "-[NSLayoutDimension constraintEqualToConstant:]"
---

# `NSLayoutDimension`：`constraintEqualToConstant()` 方法

**`constraintEqualToConstant()`** 方法创建一条约束：这个尺寸等于一个常数（这个尺寸 = `value`）。

## 语法

```
constraintEqualToConstant(value)
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
const c = box.widthAnchor.constraintEqualToConstant(60);
c.isActive = true;
console.log(c.relation, c.constant, c.secondAnchor);
```

**结果**：`box` 的宽是 60 pt。控制台输出 `equal 60 null`。

## 对应的 iOS API

`-[NSLayoutDimension constraintEqualToConstant:]`。

## 参见

- [`constraintGreaterThanOrEqualToConstant()`](constraintgreaterthanorequaltoconstant.md)
- [`constraintLessThanOrEqualToConstant()`](constraintlessthanorequaltoconstant.md)
- [`constraintEqualToAnchor()`](constraintequaltoanchor.md)：和另一个尺寸比
