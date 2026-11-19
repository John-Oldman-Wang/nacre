---
type: reference
native: "-[UIStackView removeArrangedSubview:]"
---

# `UIStackView`：`removeArrangedSubview()` 方法

**`removeArrangedSubview()`** 方法让一个视图不再参与排列。视图仍然是容器的子视图，仍然显示在屏幕上。

要把视图从屏幕上移走，用 [`view.removeFromSuperview()`](../ui-view/removefromsuperview.md)。它会同时把视图移出排列。

## 语法

```
removeArrangedSubview(view)
```

### 参数

**`view`**

要移出排列的 `UIView`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`view` 不是视图，或者没传：`removeArrangedSubview needs a UIView`。抛错时排列保持原样。

## 示例

```js
const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
  const block = new UIView();
  block.backgroundColor = color;
  return block;
});
const row = new UIStackView([red, orange, teal]);
row.distribution = 'fillEqually';

row.removeArrangedSubview(orange);

console.log(row.arrangedSubviews.length);
console.log(orange.superview === row);
console.log(row.subviews.length);
```

**结果**

- 依次输出 `2`、`true`、`3`。
- 红色块和青色块平分整行。橙色块仍然在视图树里，容器不再安排它的位置。**橙色块此时显示在哪里未在模拟器验证。**

## 对应的 iOS API

`-[UIStackView removeArrangedSubview:]`。

## 参见

- [`removeFromSuperview()`](../ui-view/removefromsuperview.md)：真正移除
- [排列项和子视图](../ui-stack-view.md#排列项和子视图)
