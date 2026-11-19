---
type: reference
native: UIView.contentScaleFactor
---

# `UIView`: `contentScaleFactor` property

The **`contentScaleFactor`** property is the pixel multiple at which the view's content is drawn: how many pixels 1 pt covers.

## Value

A number, a ratio with no unit.

- Readable and writable.
- The default is determined by the screen; current iPhones use 3. **Not verified in the simulator.**
- Converted with `Number()` on write. If it doesn't convert to a finite number, throws `TypeError: contentScaleFactor must be a finite number, got …`.
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. The effect of writing other values is **not verified in the simulator**.

## Examples

```js
const view = new UIView();
console.log(view.contentScaleFactor);
```

**Result**: Prints the screen's scale. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.contentScaleFactor`.

## See also

- [Units](../units.md): pt and pixels
- [`traitCollection`](traitcollection.md): `displayScale`
