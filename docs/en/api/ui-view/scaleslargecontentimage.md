---
type: reference
native: UIView.scalesLargeContentImage
---

# `UIView`: `scalesLargeContentImage` property

The **`scalesLargeContentImage`** property determines whether [`largeContentImage`](largecontentimage.md) is scaled up in the large content viewer.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Scales the image up |
| `false` | Shows it at its original size |

- Readable and writable.
- The default is **not verified in the simulator**.
- Written values are converted with `Boolean()`: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- The type that reads back, and that writing back the original value leaves it unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

## Examples

```js
const item = new UIView();
item.scalesLargeContentImage = true;
```

**Effect**: The image scales up in the large content viewer. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.scalesLargeContentImage`.

## See also

- [`largeContentImage`](largecontentimage.md)
