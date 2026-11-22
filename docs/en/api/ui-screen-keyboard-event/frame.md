---
type: reference
native: UIScreenKeyboardEvent.frame
---

# `UIScreenKeyboardEvent`: `frame` property

The **`frame`** property is the keyboard position when the animation ends.

## Value

A [`CGRect`](../cg-rect.md) in screen coordinates, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError`.
- The keyboard height is `frame.height`, and its top edge is `frame.y`.
- In `keyboardhide`, it is the position after hiding, below the bottom edge of the screen.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
application.addEventListener('sceneconnect', (connect) => {
  connect.scene.screen.addEventListener('keyboardshow', (e) => {
    console.log('键盘高度', e.frame.height);
  });
});
```

**Effect**: when the keyboard appears, prints its height in pt.

## Corresponding iOS API

`userInfo[UIKeyboardFrameEndUserInfoKey]` of the notification.

## See also

- [`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)
