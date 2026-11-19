---
type: reference
native: UIScrollView.bouncesVertically
---

# `UIScrollView`: `bouncesVertically` property

The **`bouncesVertically`** property indicates whether, after scrolling to an end vertically, it can be pulled a little further and spring back on release.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | It bounces vertically |
| `false` | It stops at the end vertically |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after writing back the original value; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.bouncesVertically = false;
console.log(scroller.bouncesVertically);
```

**Effect**: the console logs `false`. It stops at the end vertically; **not verified in the simulator**.

## Corresponding iOS API

`UIScrollView.bouncesVertically`.

## See also

- [`bounces`](bounces.md)
