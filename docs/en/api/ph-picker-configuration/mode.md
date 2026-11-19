---
type: reference
native: PHPickerConfiguration.mode
---

# `PHPickerConfiguration`: `mode` property

The **`mode`** property indicates what the photo picker looks like.

## Value

A string, one of the following two:

| Value | Effect |
| --- | --- |
| `'default'` | The full photo picker |
| `'compact'` | Just a row of thumbnails. For pickers embedded in a view controller |

- Readable and writable.
- Defaults to `'default'`.
- How `'compact'` looks on screen is **not verified in the simulator**.
- Only the app can change it; there's no change notification.

### Invalid values

Writing a value not in the table doesn't throw: the property keeps its previous value, and the console prints a warning listing the available values:

```
[Nacre] mode has no value "full"; expected one of: default / compact, ignored
```

## Examples

```js
const config = new PHPickerConfiguration();
config.mode = 'compact';
console.log(config.mode);
```

**Result**: prints `compact`.

## Corresponding iOS API

`PHPickerConfiguration.mode`. `PHPickerModeCompact` is written as `'compact'`.

## See also

- [Enums](../enums.md)
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
