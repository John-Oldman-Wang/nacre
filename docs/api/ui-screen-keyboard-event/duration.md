---
type: reference
native: UIScreenKeyboardEvent.duration
---

# `UIScreenKeyboardEvent`：`duration` 属性

**`duration`** 属性是键盘动画的时长。

## 值

数，单位是秒。

- 只读。给它赋值抛 `TypeError`。
- 让界面用同样的时长做动画，就和键盘一起移动。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
application.addEventListener('sceneconnect', (connect) => {
  connect.scene.screen.addEventListener('keyboardshow', (e) => {
    console.log('动画', e.duration, '秒');
  });
});
```

**效果**：键盘出现时，输出动画的时长，比如 `动画 0.25 秒`。

## 对应的 iOS API

通知的 `userInfo[UIKeyboardAnimationDurationUserInfoKey]`。

## 参见

- [`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)
