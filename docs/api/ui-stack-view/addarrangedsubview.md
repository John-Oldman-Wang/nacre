---
type: reference
native: "-[UIStackView addArrangedSubview:]"
---

# `UIStackView`：`addArrangedSubview()` 方法

**`addArrangedSubview()`** 方法把一个视图加到排列的末尾。

## 语法

```
addArrangedSubview(view)
```

### 参数

**`view`**

要加入的 `UIView`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `view` 不是视图（`null`、数、字符串、不是视图的原生对象），或者没传：`addArrangedSubview needs a UIView`。
- `view` 是还没有原生对象的窗口（`new UIWindow()` 不传场景，并且还没给 `windowScene` 赋值）：`addArrangedSubview:: UIWindow has no native object yet, so it cannot be passed as an argument`。

抛错时排列保持原样。

## 说明

- 视图同时成为容器的子视图，不用再调 `addSubview()`。它原来有别的父视图时，会从原来的父视图里移出。
- 视图的 `translatesAutoresizingMaskIntoConstraints` 被设成 `false`（实测）。不要再给它写决定位置的约束，只在需要时写宽度或高度。
- 排列在下一次布局时更新。要立刻读到新的 `frame`，先调 `layoutIfNeeded()`。

## 示例

```js
const row = new UIStackView();
const gray = new UIView();
gray.backgroundColor = 'systemGray';
row.addArrangedSubview(gray);

console.log(gray.superview === row);
console.log(gray.translatesAutoresizingMaskIntoConstraints);
```

**结果**：依次输出 `true`、`false`。

## 对应的 iOS API

`-[UIStackView addArrangedSubview:]`。

## 参见

- [`insertArrangedSubview()`](insertarrangedsubview.md)：插到指定位置
- [`removeFromSuperview()`](../ui-view/removefromsuperview.md)：移除排列项
- [排列项和子视图](../ui-stack-view.md#排列项和子视图)
