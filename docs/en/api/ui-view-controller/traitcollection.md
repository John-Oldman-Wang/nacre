---
type: reference
native: UIViewController.traitCollection
---

# `UIViewController`: `traitCollection` property

The **`traitCollection`** property is the appearance traits of this view controller's environment: dark or light, the screen scale, how large the text is.

## Value

A [`UITraitCollection`](../ui-trait-collection.md).

- Read-only; assigning to it throws `TypeError`.
- When the appearance traits change, the [`traitchange`](traitchange-event.md) event fires.
- For the values and what to watch for, see [Appearance traits](../ui-trait-collection.md).

## Examples

```js
const page = new UIViewController();
console.log(page.traitCollection.userInterfaceStyle);
```

**Result**: Prints whether it is currently light or dark, such as `light`. The value read before the view controller is shown is **not verified in the simulator**.

## Corresponding iOS API

`UIViewController.traitCollection`.

## See also

- [`overrideUserInterfaceStyle`](overrideuserinterfacestyle.md)
- [`traitchange`](traitchange-event.md)
