---
type: reference
native: UILayoutGuide.owningView
---

# `UILayoutGuide`：`owningView` 属性

**`owningView`** 属性是这个 layout guide 被加到了哪个视图上。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 还没加到视图上时是 `null`。**这一条未在模拟器验证。**
- 用视图的 [`addLayoutGuide()`](../ui-view/addlayoutguide.md) 加上去之后，是那个视图；用 [`removeLayoutGuide()`](../ui-view/removelayoutguide.md) 移除之后变回 `null`。**移除后变回 `null` 未在模拟器验证。**
- 系统提供的 layout guide（`safeAreaLayoutGuide` 这一类）的 `owningView` 是提供它的那个视图。**未在模拟器验证。**
- 没有变化通知。只有 App 自己的代码会改它。

## 示例

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
console.log(guide.owningView === card);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UILayoutGuide.owningView`。

## 参见

- [`layoutFrame`](layoutframe.md)：在它的坐标系里
