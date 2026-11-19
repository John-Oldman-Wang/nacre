---
type: reference
native: UIView.traitCollection
---

# `UIView`: `traitCollection` property

The **`traitCollection`** property is the traits of the environment this view is in: dark or light, the display scale, and the text size.

## Value

[`UITraitCollection`](../ui-trait-collection.md).

- Read-only; assigning to it throws `TypeError`.
- Each read returns the values at that moment; the object doesn't update itself.
- When the traits change, the [`traitchange`](traitchange-event.md) event fires.

## Examples

```js
const view = new UIView();
if (view.traitCollection.userInterfaceStyle === 'dark') {
  console.log('Dark mode is on');
}
```

**Result**: Logs `Dark mode is on` when the system is in dark mode.

## Corresponding iOS API

`UIView.traitCollection`.

## See also

- [Traits](../ui-trait-collection.md)
- [`overrideUserInterfaceStyle`](overrideuserinterfacestyle.md)
- [`traitchange`](traitchange-event.md)
