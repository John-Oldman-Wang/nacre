---
type: reference
native: UIScreenKeyboardEvent.frame
---

# `UIScreenKeyboardEvent`：`frame` 属性

**`frame`** 属性是动画结束时键盘的位置。

## 值

[`CGRect`](../cg-rect.md)，屏幕坐标，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 键盘的高度是 `frame.height`，键盘的上边缘是 `frame.y`。
- `keyboardhide` 里是键盘收起之后的位置，在屏幕下边缘之外。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
application.addEventListener('sceneconnect', (connect) => {
  connect.scene.screen.addEventListener('keyboardshow', (e) => {
    console.log('键盘高度', e.frame.height);
  });
});
```

**效果**：键盘出现时，输出键盘的高度，单位 pt。

## 对应的 iOS API

通知的 `userInfo[UIKeyboardFrameEndUserInfoKey]`。

## 参见

- [`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)
