---
type: reference
native: UIDevice.localizedModel
---

# `UIDevice`: `localizedModel` property

The **`localizedModel`** property is [`model`](model.md) translated into the system language.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value is unchanged.
- Measured as `'iPhone'` when the system language is English. Values in other languages are **not verified in the simulator**.
- Whether this value changes when the system language changes while the app is running is **not verified in the simulator**; the runtime fires no change notification for it.

## Examples

```js
console.log(UIDevice.currentDevice.localizedModel);
```

**Result**: Prints `iPhone` when the system language is English.

## Corresponding iOS API

`UIDevice.localizedModel`.

## See also

- [`model`](model.md)
