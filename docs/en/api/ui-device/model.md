---
type: reference
native: UIDevice.model
---

# `UIDevice`: `model` property

The **`model`** property is the kind of device.

## Value

A string. `'iPhone'` on iPhone, and also in the simulator.

- Read-only. Assigning to it throws `TypeError`, and the value is unchanged.
- It doesn't change while the app is running, so there is no change notification.
- It isn't the specific model: it can't tell an iPhone 14 from an iPhone Air. The specific model currently can't be read.

## Examples

```js
console.log(UIDevice.currentDevice.model);
```

**Result**: Prints `iPhone` on both iPhone and the iPhone simulator.

## Corresponding iOS API

`UIDevice.model`.

## See also

- [`localizedModel`](localizedmodel.md): translated into the system language
- [`userInterfaceIdiom`](userinterfaceidiom.md): the kind of interface
