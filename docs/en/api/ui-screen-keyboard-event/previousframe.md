---
type: reference
native: UIScreenKeyboardEvent.previousFrame
---

# `UIScreenKeyboardEvent`: `previousFrame` property

The **`previousFrame`** property is the keyboard position when the animation starts.

## Value

A [`CGRect`](../cg-rect.md) in screen coordinates, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
application.addEventListener('sceneconnect', (connect) => {
  connect.scene.screen.addEventListener('keyboardchange', (e) => {
    console.log('高度从', e.previousFrame.height, '变成', e.frame.height);
  });
});
```

**Effect**: when the keyboard size changes (for example, after switching input methods), prints the heights before and after. **Not verified in the simulator.**

## Corresponding iOS API

`userInfo[UIKeyboardFrameBeginUserInfoKey]` of the notification.

## See also

- [`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)
