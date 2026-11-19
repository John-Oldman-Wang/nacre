---
type: reference
native: UIView.clearsContextBeforeDrawing
---

# `UIView`: `clearsContextBeforeDrawing` property

The **`clearsContextBeforeDrawing`** property is a drawing hint for the system: whether the existing content is cleared before the view's content is redrawn.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Cleared first, then drawn |
| `false` | Not cleared; drawn over the existing content |

- Readable and writable.
- The default is `true` (according to Apple's documentation; **not verified in the simulator**).
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. Writing it has no visible effect.

## Examples

```js
const view = new UIView();
view.clearsContextBeforeDrawing = false;
```

**Effect**: The appearance doesn't change.

## Corresponding iOS API

`UIView.clearsContextBeforeDrawing`.

## See also

- [`setNeedsDisplay()`](setneedsdisplay.md)
