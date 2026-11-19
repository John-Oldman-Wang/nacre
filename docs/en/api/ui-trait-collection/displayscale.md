---
type: reference
native: UITraitCollection.displayScale
---

# `UITraitCollection`: `displayScale` property

The **`displayScale`** property is how many pixels 1 [pt](../units.md) covers on the screen.

## Value

A number, unitless.

- Current iPhones are 3. Measured as 3 in the iPhone Air simulator.
- A view not yet added to the UI can also read the screen's scale (measured as 3, not 0).
- Two common uses: to draw a 1-pixel-wide hairline, make the width `1 / displayScale` pt; to make a [layer](../ca-layer.md) you create render sharply, set its [`contentsScale`](../ca-layer/contentsscale.md) to this value.
- Don't hard-code 3; read it from here.

- Read-only. Assigning to it throws `TypeError`.
- It holds the value at the moment `traitCollection` was read and doesn't change afterwards. When the environment changes, views, view controllers, and scenes fire [`traitchange`](../ui-trait-collection.md#the-traitchange-event); read `traitCollection` again for the new value.

## Examples

```js
const view = new UIView();
const scale = view.traitCollection.displayScale;
console.log(scale);
console.log(1 / scale);
```

**Result**: in the iPhone Air simulator, prints `3` and `0.3333333333333333`.

## Corresponding iOS API

`UITraitCollection.displayScale`.

## See also

- [`UITraitCollection`](../ui-trait-collection.md)
- [Units](../units.md)
