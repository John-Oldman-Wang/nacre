---
type: reference
native: UIView.window
---

# `UIView`：`window` 属性

**`window`** 属性是视图所在的窗口。

## 值

[`UIWindow`](../ui-window.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `null`。视图没有连到窗口时是 `null`。
- 视图加到窗口下面才会显示，这时它有值。
- 没有变化通知。视图被加入、移除时的通知还没有实现，见[还不能做的](../ui-view.md#还不能做的)。

## 示例

```js
const view = new UIView();
console.log(view.window);
```

**结果**：输出 `null`。新建的视图不在任何窗口里。

## 对应的 iOS API

`UIView.window`。

## 参见

- [`UIWindow`](../ui-window.md)
- [视图树和叠放顺序](../ui-view.md#视图树和叠放顺序)
