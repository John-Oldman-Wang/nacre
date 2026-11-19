---
type: reference
native: UIView.autoresizesSubviews
---

# `UIView`: `autoresizesSubviews` property

The **`autoresizesSubviews`** property determines whether, when the view's size changes, its subviews are adjusted according to their [`autoresizingMask`](autoresizingmask.md).

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Subviews are adjusted according to their `autoresizingMask` |
| `false` | Subviews don't move |

- Readable and writable.
- The default is `true` (according to Apple's documentation; **not verified in the simulator**).
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

## Examples

```js
const container = new UIView();
container.autoresizesSubviews = false;
```

**Effect**: When `container` grows or shrinks, subviews positioned by `frame` aren't adjusted. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.autoresizesSubviews`.

## See also

- [`autoresizingMask`](autoresizingmask.md)
