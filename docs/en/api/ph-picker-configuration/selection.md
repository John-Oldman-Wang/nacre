---
type: reference
native: PHPickerConfiguration.selection
---

# `PHPickerConfiguration`: `selection` property

The **`selection`** property indicates how selection works: how selected items are marked, and when [`pick`](../photos/pick-event.md) fires.

## Value

A string, one of the following four:

| Value | Effect |
| --- | --- |
| `'default'` | Selected items get a checkmark |
| `'ordered'` | Selected items show the order in which they were selected, and `results` is given in that order |
| `'continuous'` | `pick` fires each time an item is selected or deselected, without waiting for the user to tap "Add" |
| `'continuousAndOrdered'` | `'continuous'` plus numbering |

- Readable and writable.
- Defaults to `'default'`.
- The on-screen effect of each value is **not verified in the simulator**.
- Only the app can change it; there's no change notification.

### Invalid values

Writing a value not in the table doesn't throw: the console prints a warning listing all available values, and the property keeps its previous value. The same applies to writing a number.

## Examples

```js
const config = new PHPickerConfiguration();
config.selectionLimit = 0;
config.selection = 'ordered';
```

**Effect**: a photo picker created with this configuration has no limit on the number of images, shows a sequence number on each selected image, and orders `results` by selection order. **Not verified in the simulator.**

## Corresponding iOS API

`PHPickerConfiguration.selection`. `PHPickerConfigurationSelectionOrdered` is written as `'ordered'`, and likewise for the rest.

## See also

- [`pick`](../photos/pick-event.md): when it fires in the two continuous modes
- [Enums](../enums.md)
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
