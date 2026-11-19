---
type: reference
native: UIDevice.userInterfaceIdiom
---

# `UIDevice`: `userInterfaceIdiom` property

The **`userInterfaceIdiom`** property is the kind of interface: which class of device's interface apps on this device display.

## Value

A string, one of the following:

| Value | Meaning |
| --- | --- |
| `'phone'` | The iPhone interface. The runtime currently supports only iPhone, so this is always the value read |
| `'pad'` | The iPad interface |
| `'tv'` | The Apple TV interface |
| `'carPlay'` | The in-car interface |
| `'mac'` | The Mac interface |
| `'vision'` | The Apple Vision interface |
| `'unspecified'` | Unspecified |

- Read-only. Assigning to it throws `TypeError`, and the value is unchanged.
- It doesn't change while the app is running, so there is no change notification.
- Values other than `'phone'` are **not verified in the simulator**.

## Examples

```js
if (UIDevice.currentDevice.userInterfaceIdiom === 'phone') {
  console.log('iPhone interface');
}
```

**Result**: Prints `iPhone interface` on iPhone.

## Corresponding iOS API

`UIDevice.userInterfaceIdiom`. `UIUserInterfaceIdiomPhone` is written as `'phone'`, and likewise for the rest.

## See also

- [`model`](model.md)
- [`UITraitCollection`](../ui-trait-collection.md): other traits of the interface
