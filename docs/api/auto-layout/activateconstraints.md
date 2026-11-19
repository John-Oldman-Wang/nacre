---
type: reference
native: "+[NSLayoutConstraint activateConstraints:]"
---

# `NSLayoutConstraint.activateConstraints()` 静态方法

**`NSLayoutConstraint.activateConstraints()`** 静态方法一次激活一组约束。效果等于把每一条的 [`isActive`](isactive.md) 设成 `true`。

## 语法

```
NSLayoutConstraint.activateConstraints(constraints)
```

### 参数

**`constraints`**

约束的数组，或者任何可迭代的对象。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 某一条约束的两端没有共同祖先：信息以 `failed to activate constraint:` 开头，后面是 UIKit 给出的原因。
- 数组里有不是约束的元素（数、字符串、`null`、别的原生对象）：`activateConstraints needs a list of NSLayoutConstraint`。

> **注意**：数组里只要有一个元素不是约束，整批都不激活，不会只激活合法的那几条。

## 说明

一次要激活多条约束时用这个方法。逐条设 `isActive` 时，前几条已经生效、后几条还没生效，中间会经过约束不完整的状态；批量激活没有这个中间状态。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const width = box.widthAnchor.constraintEqualToConstant(60);
const height = box.heightAnchor.constraintEqualToConstant(44);
NSLayoutConstraint.activateConstraints([width, height]);
console.log(width.isActive, height.isActive);
```

**结果**：输出 `true true`。

## 对应的 iOS API

`+[NSLayoutConstraint activateConstraints:]`。

## 参见

- [`isActive`](isactive.md)
- [`deactivateConstraints()`](deactivateconstraints.md)
