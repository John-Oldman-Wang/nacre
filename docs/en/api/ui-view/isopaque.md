---
type: reference
native: UIView.opaque
---

# `UIView`: `isOpaque` property

The **`isOpaque`** property is a drawing hint for the system; it doesn't change the appearance.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Declares that the view's content is fully opaque, so the system can skip drawing what is behind it |
| `false` | The system treats it as possibly transparent |

- Readable and writable.
- The default is `true`.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.

## Examples

```js
const view = new UIView();
view.isOpaque = false;
```

**Effect**: The appearance doesn't change.

## Corresponding iOS API

`UIView.opaque`. The ObjC getter name is `isOpaque`, and JS reads and writes it under that name.

## See also

- [`alpha`](alpha.md)
