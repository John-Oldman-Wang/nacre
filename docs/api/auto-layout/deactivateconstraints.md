---
type: reference
native: "+[NSLayoutConstraint deactivateConstraints:]"
---

# `NSLayoutConstraint.deactivateConstraints()` 静态方法

**`NSLayoutConstraint.deactivateConstraints()`** 静态方法一次停用一组约束。效果等于把每一条的 [`isActive`](isactive.md) 设成 `false`。

## 语法

```
NSLayoutConstraint.deactivateConstraints(constraints)
```

### 参数

**`constraints`**

约束的数组，或者任何可迭代的对象。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 数组里有不是约束的元素（数、字符串、`null`、别的原生对象）：`deactivateConstraints needs a list of NSLayoutConstraint`。

> **注意**：数组里只要有一个元素不是约束，整批都不停用，不会只停用合法的那几条。

## 说明

停用的约束对象仍然可用，可以再次激活。只停用、不补上新约束时，那个量就没有约束确定了，系统不报错。实测：一张卡片只停用高度约束之后，高度变成 16 pt（上下两个 8 pt 的边距），里面三个色块的高度变成 0。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const width = box.widthAnchor.constraintEqualToConstant(60);
const height = box.heightAnchor.constraintEqualToConstant(44);
NSLayoutConstraint.activateConstraints([width, height]);
NSLayoutConstraint.deactivateConstraints([height]);
console.log(width.isActive, height.isActive);
```

**结果**：输出 `true false`。

## 对应的 iOS API

`+[NSLayoutConstraint deactivateConstraints:]`。

## 参见

- [`isActive`](isactive.md)
- [`activateConstraints()`](activateconstraints.md)
