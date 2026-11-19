---
type: reference
native: "-[UIStackView initWithArrangedSubviews:]"
---

# `UIStackView()` 构造函数

**`UIStackView()`** 构造函数创建一个排列容器，可以一开始就放进一组排列项。

## 语法

```
new UIStackView([arrangedSubviews])
```

### 参数

**`arrangedSubviews`**

一开始就放进去的排列项，`UIView` 的数组，按数组顺序排列。可以不传，不传时容器是空的。

- 可以是数组，也可以是任何可迭代的对象。传 `null` 或 `undefined` 和不传相同。
- 数组里的视图同时成为容器的子视图，不用再调 `addSubview()`。
- 数组里的视图原来有父视图时，会从原来的父视图里移出。
- 数组里的视图的 `translatesAutoresizingMaskIntoConstraints` 被设成 `false`。

### 返回值

新建的 `UIStackView`。位置是 `(0, 0)`，宽高是 0；`axis` 是 `'horizontal'`，`distribution` 和 `alignment` 是 `'fill'`，`spacing` 是 0。

### 异常

**`TypeError`**

`UIStackView` 不能被继承：`class X extends UIStackView {}` 之后 `new X()` 抛错，见[原生类](../native-classes.md)。

数组里不是视图的元素（数、字符串、`null`）**不报错，被跳过**。这和 [`addArrangedSubview()`](addarrangedsubview.md) 等方法的行为不一致，是已知问题。类型检查能发现这种错误。

## 示例

```js
const red = new UIView();
red.backgroundColor = 'systemRed';
const teal = new UIView();
teal.backgroundColor = 'systemTeal';

const empty = new UIStackView();
const filled = new UIStackView([red, teal]);

console.log(empty.arrangedSubviews.length, filled.arrangedSubviews.length);
console.log(red.superview === filled);
```

**结果**：依次输出 `0 2`、`true`。

## 对应的 iOS API

`[[UIStackView alloc] init]` 写成 `new UIStackView()`；`[[UIStackView alloc] initWithArrangedSubviews:@[a, b]]` 写成 `new UIStackView([a, b])`。

## 参见

- [`addArrangedSubview()`](addarrangedsubview.md)：之后再加排列项
- [排列项和子视图](../ui-stack-view.md#排列项和子视图)
