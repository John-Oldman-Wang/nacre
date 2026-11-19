---
type: reference
native: UIKeyboardWillHideNotification
---

# `UIScreen`：`keyboardhide` 事件

**`keyboardhide`** 事件在键盘要收起时派发。

## 语法

```
screen.addEventListener('keyboardhide', (event) => { })
```

## 事件对象

`UIScreenKeyboardEvent`，除 `type`、`target`（这块屏幕）以外带三个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `frame` | [`CGRect`](../cg-rect.md) | 动画结束时键盘的位置，屏幕坐标，单位 pt。键盘的高度是 `frame.height` |
| `previousFrame` | [`CGRect`](../cg-rect.md) | 动画开始时键盘的位置 |
| `duration` | 数 | 键盘动画的时长，单位秒 |

不能取消。iPhone 上 App 占满整个屏幕，屏幕坐标和窗口里的坐标相同。

## 什么时候派发

- 输入框交出 first responder、软键盘要收起时派发。
- 先派发 [`keyboardchange`](keyboardchange-event.md)，再派发 `keyboardhide`（实测）。
- 收起之后键盘在屏幕底边以下：`frame.y` 不小于屏幕的高度，或者 `frame.height` 是 0。

**当场派发**：监听器在键盘的动画里执行。监听器里改视图的 `frame`、改约束再调 `layoutIfNeeded()`，这些改动会跟着键盘一起动，时长和速度曲线都和键盘相同，不用自己写动画（实测）。

JS 自己调 `endEditing()` 收起键盘时，监听器在 `endEditing()` 返回之前就执行完了（实测）。

## 示例

```js
const page = new UIViewController();
const bar = new UIView();
bar.frame = new CGRect(0, 800, 390, 56);
page.view.addSubview(bar);
const screen = /** @type {UIWindowScene} */ (application.scenes[0]).screen;
screen.addEventListener('keyboardhide', () => {
  bar.frame = new CGRect(0, 800, 390, 56);
});
```

**效果**：键盘收起时，`bar` 跟着键盘一起回到底部。

## 对应的 iOS API

`UIKeyboardWillHideNotification`。

## 参见

- [`keyboardLayoutGuide`](../ui-keyboard-layout-guide.md)：用约束跟着键盘，不用监听事件
- [`UIScreen`](../ui-screen.md)
