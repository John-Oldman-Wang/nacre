---
type: reference
native: UIScreenKeyboardEvent.previousFrame
---

# `UIScreenKeyboardEvent`：`previousFrame` 属性

**`previousFrame`** 属性是动画开始时键盘的位置。

## 值

[`CGRect`](../cg-rect.md)，屏幕坐标，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
application.addEventListener('sceneconnect', (connect) => {
  connect.scene.screen.addEventListener('keyboardchange', (e) => {
    console.log('高度从', e.previousFrame.height, '变成', e.frame.height);
  });
});
```

**效果**：键盘的大小变了时（比如换了输入法），输出变化前后的高度。**未在模拟器验证。**

## 对应的 iOS API

通知的 `userInfo[UIKeyboardFrameBeginUserInfoKey]`。

## 参见

- [`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)
