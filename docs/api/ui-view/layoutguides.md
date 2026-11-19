---
type: reference
native: UIView.layoutGuides
---

# `UIView`：`layoutGuides` 属性

**`layoutGuides`** 属性是用 [`addLayoutGuide()`](addlayoutguide.md) 加在这个视图上的 layout guide。

## 值

[`UILayoutGuide`](../ui-layout-guide.md) 的只读数组。

- 只读。给它赋值抛 `TypeError`。
- 不包括系统提供的 `safeAreaLayoutGuide`、`layoutMarginsGuide`、`readableContentGuide`、`keyboardLayoutGuide`。

## 示例

```js
const card = new UIView();
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);
console.log(card.layoutGuides.includes(spacer));
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIView.layoutGuides`。

## 参见

- [`addLayoutGuide()`](addlayoutguide.md)、[`removeLayoutGuide()`](removelayoutguide.md)
