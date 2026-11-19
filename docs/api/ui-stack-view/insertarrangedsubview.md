---
type: reference
native: "-[UIStackView insertArrangedSubview:atIndex:]"
---

# `UIStackView`：`insertArrangedSubview()` 方法

**`insertArrangedSubview()`** 方法把一个视图插到排列的指定位置。

## 语法

```
insertArrangedSubview(view, { atIndex })
```

### 参数

**`view`**

要插入的 `UIView`。

**`options.atIndex`**

整数，必填。插入后这个视图在排列里的位置，从 0 开始。范围是 0 到当前的项数，等于项数时加在末尾，效果和 [`addArrangedSubview()`](addarrangedsubview.md) 一样。小数向零取整。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没传 `atIndex`，或者写成 `{ atIndex: undefined }`：`insertArrangedSubview needs { atIndex }`。
- `atIndex` 转不成有限数（`NaN`、`'abc'`）：`atIndex must be a finite number, got NaN`。
- `view` 不是视图：`insertArrangedSubview needs a UIView`。
- `atIndex` 超出范围：`insertArrangedSubview: atIndex 99 is out of range (0...3)`。括号里是允许的范围，后一个数是当前的项数。

抛错时不插入，排列保持原样。

## 说明

- 视图同时成为容器的子视图，`translatesAutoresizingMaskIntoConstraints` 被设成 `false`，和 `addArrangedSubview()` 相同。
- 视图已经是排列项时，它被移到新的位置。**未在模拟器验证。**

## 示例

```js
const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
  const block = new UIView();
  block.backgroundColor = color;
  return block;
});
const row = new UIStackView([red, orange, teal]);
row.distribution = 'fillEqually';

const purple = new UIView();
purple.backgroundColor = 'systemPurple';
row.insertArrangedSubview(purple, { atIndex: 1 });
```

**效果**：紫色块排在第二个，顺序变成红、紫、橙、青，四项等宽。

## 对应的 iOS API

`-[UIStackView insertArrangedSubview:atIndex:]`，`atIndex:` 写成 options 的键。

## 参见

- [`addArrangedSubview()`](addarrangedsubview.md)
