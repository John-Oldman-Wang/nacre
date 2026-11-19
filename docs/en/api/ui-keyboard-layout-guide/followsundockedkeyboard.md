---
type: reference
native: UIKeyboardLayoutGuide.followsUndockedKeyboard
---

# `UIKeyboardLayoutGuide`: `followsUndockedKeyboard` property

The **`followsUndockedKeyboard`** property determines whether the layout guide still follows the keyboard when the keyboard leaves the bottom of the screen.

## Value

A boolean.

- Readable and writable.
- The default value is `false`. Reading, writing, and the default value are asserted in the acceptance tests.
- There is no change notification. Only the app's own code changes it.

| Value | Effect |
| --- | --- |
| `true` | Follows the keyboard even when it leaves the bottom of the screen (the floating and split keyboards on iPad) |
| `false` | When the keyboard leaves the bottom of the screen, it is treated as if there were no keyboard |

Relevant only to the floating and split keyboards on iPad. Nacre supports only iPhone; the effect of setting it on iPhone is **not verified in the simulator**.

- Values are converted with `Boolean()` when written.

## Examples

```js
const guide = new UIView().keyboardLayoutGuide;
console.log(guide.followsUndockedKeyboard);
guide.followsUndockedKeyboard = true;
console.log(guide.followsUndockedKeyboard);
```

**Result**: logs `false`, then `true`.

## Corresponding iOS API

`UIKeyboardLayoutGuide.followsUndockedKeyboard`.

## See also

- [`UIKeyboardLayoutGuide`](../ui-keyboard-layout-guide.md)
