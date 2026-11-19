---
type: reference
native: UIKeyboardWillShowNotification
---

# `UIScreen`：`keyboardshow` 事件

**`keyboardshow`** 事件在键盘要弹出时派发。

## 语法

```
screen.addEventListener('keyboardshow', (event) => { })
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

- 用户点了输入框，或者代码让输入框成为 first responder，软键盘要弹出时派发。
- 先派发 [`keyboardchange`](keyboardchange-event.md)，再派发 `keyboardshow`（实测）。
- 连着电脑键盘的模拟器上软键盘不弹，不派发。

**当场派发**：监听器在键盘的动画里执行。监听器里改视图的 `frame`、改约束再调 `layoutIfNeeded()`，这些改动会跟着键盘一起动，时长和速度曲线都和键盘相同，不用自己写动画（实测）。

JS 自己调 `endEditing()` 收起键盘时，监听器在 `endEditing()` 返回之前就执行完了（实测）。

## 示例

```js
const page = new UIViewController();
const bar = new UIView();
bar.frame = new CGRect(0, 800, 390, 56);
page.view.addSubview(bar);
const screen = /** @type {UIWindowScene} */ (application.scenes[0]).screen;
screen.addEventListener('keyboardshow', (e) => {
  const event = /** @type {UIScreenKeyboardEvent} */ (e);
  bar.frame = new CGRect(0, event.frame.y - 56, 390, 56);
});
```

**效果**：底部的 `bar` 跟着键盘一起往上移，停在键盘顶上。

## 对应的 iOS API

`UIKeyboardWillShowNotification`。

## 参见

- [`keyboardLayoutGuide`](../ui-keyboard-layout-guide.md)：用约束跟着键盘，不用监听事件
- [`UIScreen`](../ui-screen.md)
