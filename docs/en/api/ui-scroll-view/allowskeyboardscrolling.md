---
type: reference
native: UIScrollView.allowsKeyboardScrolling
---

# `UIScrollView`: `allowsKeyboardScrolling` property

The **`allowsKeyboardScrolling`** property indicates whether the arrow and page keys of a hardware keyboard can scroll it.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | A hardware keyboard can scroll it |
| `false` | It cannot |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after writing back the original value; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.allowsKeyboardScrolling = false;
console.log(scroller.allowsKeyboardScrolling);
```

**Effect**: the console logs `false`. A hardware keyboard cannot scroll it; **not verified in the simulator**.

## Corresponding iOS API

`UIScrollView.allowsKeyboardScrolling`.
