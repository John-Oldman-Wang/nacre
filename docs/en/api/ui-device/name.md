---
type: reference
native: UIDevice.name
---

# `UIDevice`: `name` property

The **`name`** property is the device's name. It can't read the name the user gave the device in Settings.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value is unchanged.
- Measured on a device (iPhone 14) as `'iPhone'`, the same as [`model`](model.md).
- Measured in the simulator as the simulator's name, for example `'iPhone Air'`.
- It doesn't change while the app is running, so there is no change notification.

So don't use `name` to display "So-and-so's iPhone", and don't use it to determine the model.

## Examples

```js
console.log(UIDevice.currentDevice.name);
```

**Result**: Prints `iPhone` on a device; prints `iPhone Air` in a simulator named iPhone Air.

## Corresponding iOS API

`UIDevice.name`. Reading the user-given name requires a permission that Apple grants separately, which the runtime doesn't provide.

## See also

- [`model`](model.md)
