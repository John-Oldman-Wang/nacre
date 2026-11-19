---
type: reference
native: PHPickerViewController.configuration
---

# `PHPickerViewController`: `configuration` property

The **`configuration`** property is the copy of the configuration made when the picker was constructed.

## Value

[`PHPickerConfiguration`](../ph-picker-configuration.md).

- Read-only. Assigning to it throws `TypeError`.
- It isn't the object passed to the constructor but a copy of it. Reading it twice gives the same object.
- Changing the original configuration object after construction doesn't change this value.
- Whether changing properties of this copy affects an already created picker is **not verified in the simulator**.

## Examples

```js
const config = new PHPickerConfiguration();
config.selection = 'ordered';
const picker = new PHPickerViewController(config);
console.log(picker.configuration === config);
console.log(picker.configuration.selection);
```

**Result**: First prints `false`, then `ordered`.

## Corresponding iOS API

`PHPickerViewController.configuration`.

## See also

- [`PHPickerViewController()`](constructor.md): the configuration is copied at construction
- This class belongs to the `@nacrejs/photos` package; for how to install it, see [Install first](../photos.md#installation)
