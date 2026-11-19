---
type: reference
native: UIView.keyboardLayoutGuide
---

# `UIView`：`keyboardLayoutGuide` 属性

**`keyboardLayoutGuide`** 属性是键盘占的区域。键盘收起时它的上边在安全区的底边，键盘弹出时在键盘的顶边。

## 值

[`UIKeyboardLayoutGuide`](../ui-keyboard-layout-guide.md)。

- 只读。给它赋值抛 `TypeError`。
- 由系统提供，不需要用 `addLayoutGuide()` 加，也不在 [`layoutGuides`](layoutguides.md) 里。
- 把内容的底边约束到它的 `topAnchor`，一条约束同时适用于键盘弹出和收起，并且和键盘动画同步。不需要监听键盘事件，也不需要计算键盘的高度。
- 实测：键盘收起时，`page.view.keyboardLayoutGuide.layoutFrame.height` 是 34 pt，等于屏幕底部横条占的安全区高度。

## 示例

```js
const page = new UIViewController();
const bar = new UIView();
bar.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(bar);

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  bar.heightAnchor.constraintEqualToConstant(44),
  bar.bottomAnchor.constraintEqualToAnchor(
    page.view.keyboardLayoutGuide.topAnchor, { constant: -16 }),
]);
```

**效果**：没有键盘时，`bar` 在安全区底边上方 16 pt（验收用例断言过）。键盘弹出时，`bar` 跟着键盘上移，停在键盘上方 16 pt。键盘弹出时的位置**未在模拟器验证**。

## 对应的 iOS API

`UIView.keyboardLayoutGuide`。

## 参见

- [`UIKeyboardLayoutGuide`](../ui-keyboard-layout-guide.md)
- [用约束排版](../../guides/auto-layout.md)
