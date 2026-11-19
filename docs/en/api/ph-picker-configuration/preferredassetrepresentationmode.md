---
type: reference
native: PHPickerConfiguration.preferredAssetRepresentationMode
---

# `PHPickerConfiguration`: `preferredAssetRepresentationMode` property

The **`preferredAssetRepresentationMode`** property indicates which format the photo picker gives when an item has several.

## Value

A string, one of the following three:

| Value | Effect |
| --- | --- |
| `'automatic'` | The system decides |
| `'current'` | Gives the original format where possible, without conversion. Photos taken with newer phones are HEIC, so you get HEIC |
| `'compatible'` | Gives the most widely supported format where possible, converting when needed (HEIC to JPEG). Conversion takes time |

- Readable and writable.
- Defaults to `'automatic'`.
- When retrieving as `UIImage`, the three values look no different (**not verified in the simulator**): `UIImage` accepts both formats.
- Only the app can change it; there's no change notification.

### Invalid values

Writing a value not in the table doesn't throw: the console prints a warning listing all available values, and the property keeps its previous value. The same applies to writing a number.

## Examples

```js
const config = new PHPickerConfiguration();
config.preferredAssetRepresentationMode = 'compatible';
console.log(config.preferredAssetRepresentationMode);
```

**Result**: prints `compatible`.

## Corresponding iOS API

`PHPickerConfiguration.preferredAssetRepresentationMode`. `PHPickerConfigurationAssetRepresentationModeCompatible` is written as `'compatible'`, and likewise for the rest.

## See also

- [Enums](../enums.md): why an invalid property value produces a warning
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
