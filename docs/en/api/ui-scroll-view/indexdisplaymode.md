---
type: reference
native: UIScrollView.indexDisplayMode
---

# `UIScrollView`: `indexDisplayMode` property

The **`indexDisplayMode`** property determines when the index bar is shown. According to Apple's documentation, it is for list indexes on tvOS.

## Value

A string, one of these two:

| Value | Effect |
| --- | --- |
| `'automatic'` | The system decides |
| `'alwaysHidden'` | Never shown |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after writing back the original value; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
console.log(scroller.indexDisplayMode);
```

**Result**: logs `automatic` or `alwaysHidden`. The default value is **not verified in the simulator**.

## Corresponding iOS API

`UIScrollView.indexDisplayMode`. `UIScrollViewIndexDisplayModeAlwaysHidden` is written `'alwaysHidden'`.
