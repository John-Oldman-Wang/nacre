---
type: reference
native: UIScrollView.bouncesHorizontally
---

# `UIScrollView`: `bouncesHorizontally` property

The **`bouncesHorizontally`** property indicates whether, after scrolling to an end horizontally, it can be pulled a little further and spring back on release.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | It bounces horizontally |
| `false` | It stops at the end horizontally |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after writing back the original value; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.bouncesHorizontally = false;
console.log(scroller.bouncesHorizontally);
```

**Effect**: the console logs `false`. It stops at the end horizontally; **not verified in the simulator**.

## Corresponding iOS API

`UIScrollView.bouncesHorizontally`.

## See also

- [`bounces`](bounces.md)
