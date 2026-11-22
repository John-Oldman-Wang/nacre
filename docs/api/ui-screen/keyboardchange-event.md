---
type: reference
native: UIKeyboardWillChangeFrameNotification
---

# `UIScreen`：`keyboardchange` 事件

**`keyboardchange`** 事件在键盘的位置或大小要变时派发。

## 语法

```
screen.addEventListener('keyboardchange', (event) => { })
```

## 事件对象

[`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)，除 `type`、`target`（这块屏幕）以外带三个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`frame`](../ui-screen-keyboard-event/frame.md) | [`CGRect`](../cg-rect.md) | 动画结束时键盘的位置，屏幕坐标，单位 pt。键盘的高度是 `frame.height` |
| [`previousFrame`](../ui-screen-keyboard-event/previousframe.md) | [`CGRect`](../cg-rect.md) | 动画开始时键盘的位置 |
| [`duration`](../ui-screen-keyboard-event/duration.md) | 数 | 键盘动画的时长，单位秒 |

不能取消。iPhone 上 App 占满整个屏幕，屏幕坐标和窗口里的坐标相同。

## 什么时候派发

- 键盘弹出、收起时都会派发，分别在 [`keyboardshow`](keyboardshow-event.md)、[`keyboardhide`](keyboardhide-event.md) 之前（实测）。
- 键盘显示期间高度变了也派发，比如换了输入法、出现了候选栏。**这一种未在模拟器验证。**
- 只关心「键盘现在占多高」时，监听这一个事件就够了。

**当场派发**：监听器在键盘的动画里执行。监听器里改视图的 `frame`、改约束再调 `layoutIfNeeded()`，这些改动会跟着键盘一起动，时长和速度曲线都和键盘相同，不用自己写动画（实测）。

JS 自己调 `endEditing()` 收起键盘时，监听器在 `endEditing()` 返回之前就执行完了（实测）。

## 示例

```js
const page = new UIViewController();
const bar = new UIView();
bar.frame = new CGRect(0, 800, 390, 56);
page.view.addSubview(bar);
const screen = /** @type {UIWindowScene} */ (application.scenes[0]).screen;
screen.addEventListener('keyboardchange', (event) => {
  const top = Math.min(event.frame.y, screen.bounds.height);
  bar.frame = new CGRect(0, top - 56, 390, 56);
});
```

**效果**：键盘弹出、收起、高度变化时，`bar` 都跟着键盘移动，停在键盘顶上；键盘收起时回到屏幕底部。

## 对应的 iOS API

`UIKeyboardWillChangeFrameNotification`。

## 参见

- [`keyboardLayoutGuide`](../ui-keyboard-layout-guide.md)：用约束跟着键盘，不用监听事件
- [`UIScreen`](../ui-screen.md)
