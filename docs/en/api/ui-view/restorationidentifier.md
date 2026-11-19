---
type: reference
native: UIView.restorationIdentifier
---

# `UIView`: `restorationIdentifier` property

The **`restorationIdentifier`** property is the name the system uses to identify this view when saving and restoring interface state.

## Value

A string, or `null`.

- Readable and writable.
- The default is **not verified in the simulator**; according to Apple's documentation it is `null`.
- Writing `null` or `undefined` gives `null`; other values are converted to strings.
- The type that reads back, and that writing back the original value leaves it unchanged, are checked in the acceptance tests.
- Nacre doesn't hook into the system's state restoration. Whether setting this has any effect is **not verified in the simulator**.

## Examples

```js
const view = new UIView();
view.restorationIdentifier = 'profile-header';
console.log(view.restorationIdentifier);
```

**Result**: Logs `profile-header`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.restorationIdentifier`.

## See also

- [`UIView`](../ui-view.md)
