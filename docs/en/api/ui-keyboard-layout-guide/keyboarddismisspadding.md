---
type: reference
native: UIKeyboardLayoutGuide.keyboardDismissPadding
---

# `UIKeyboardLayoutGuide`: `keyboardDismissPadding` property

The **`keyboardDismissPadding`** property is the distance at which dismissal begins early when the user drags to dismiss the keyboard.

## Value

A number, in [points (pt)](../units.md).

- Readable and writable.
- The default value is `0`. Reading, writing, and the default value are asserted in the acceptance tests.
- There is no change notification. Only the app's own code changes it.

When the user drags a scroll view downward to dismiss the keyboard, this is how far the finger still is from the keyboard's top edge when dismissal begins. Its actual effect on the UI is **not verified in the simulator**.

- Values are converted with `Number()` when written. If the result isn't a finite number, it throws `TypeError: keyboardDismissPadding must be a finite number, got …`, ending with the value received, and the property keeps its previous value.

## Examples

```js
const guide = new UIView().keyboardLayoutGuide;
guide.keyboardDismissPadding = 20;
console.log(guide.keyboardDismissPadding);
```

**Result**: logs `20`.

## Corresponding iOS API

`UIKeyboardLayoutGuide.keyboardDismissPadding`.

## See also

- [`UIKeyboardLayoutGuide`](../ui-keyboard-layout-guide.md)
