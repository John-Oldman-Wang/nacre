---
type: reference
native: UIStackView.arrangedSubviews
---

# `UIStackView`：`arrangedSubviews` 属性

**`arrangedSubviews`** 属性是容器的全部排列项，按排列顺序（从左到右或从上到下）排列。

## 值

`UIView` 的数组。

- 只读。给它赋值抛 `TypeError`。
- 新建的空容器是空数组。
- 隐藏的排列项（`isHidden` 是 `true`）也在里面。
- 每次读出来是一个新数组。数组里的视图对象是同一个，可以用 `===` 比较。改这个数组不影响容器。
- 它是 `subviews` 的一部分。用 `addSubview()` 加进来的视图在 `subviews` 里，不在这里，见[排列项和子视图](../ui-stack-view.md#排列项和子视图)。
- 没有变化通知。只有 App 自己的代码会改变排列项。

## 示例

```js
const a = new UIView();
const b = new UIView();
const row = new UIStackView([a, b]);

b.isHidden = true;
console.log(row.arrangedSubviews.length);
console.log(row.arrangedSubviews[0] === a);
console.log(row.arrangedSubviews === row.arrangedSubviews);
```

**结果**：依次输出 `2`、`true`、`false`。

## 对应的 iOS API

`UIStackView.arrangedSubviews`。

## 参见

- [`addArrangedSubview()`](addarrangedsubview.md)、[`removeArrangedSubview()`](removearrangedsubview.md)
- [`subviews`](../ui-view/subviews.md)：全部子视图
