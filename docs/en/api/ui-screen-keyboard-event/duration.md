---
type: reference
native: UIScreenKeyboardEvent.duration
---

# `UIScreenKeyboardEvent`: `duration` property

The **`duration`** property is the duration of the keyboard animation.

## Value

A number, in seconds.

- Read-only. Assigning to it throws `TypeError`.
- Animate the UI with the same duration, and it moves together with the keyboard.
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
application.addEventListener('sceneconnect', (connect) => {
  connect.scene.screen.addEventListener('keyboardshow', (e) => {
    console.log('动画', e.duration, '秒');
  });
});
```

**Effect**: when the keyboard appears, prints the animation duration, for example `动画 0.25 秒`.

## Corresponding iOS API

`userInfo[UIKeyboardAnimationDurationUserInfoKey]` of the notification.

## See also

- [`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)
