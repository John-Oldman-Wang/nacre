---
type: reference
native: "-[PHPickerConfiguration init]"
---

# `PHPickerConfiguration()` constructor

The **`PHPickerConfiguration()`** constructor creates a photo picker configuration with all properties at their default values. The configuration uses the system photo library.

## Syntax

```
new PHPickerConfiguration()
```

### Parameters

None.

### Return value

A new `PHPickerConfiguration`. Default values of its properties:

| Property | Default |
| --- | --- |
| [`selectionLimit`](selectionlimit.md) | `1` |
| [`filter`](filter.md) | `null` |
| [`preferredAssetRepresentationMode`](preferredassetrepresentationmode.md) | `'automatic'` |
| [`selection`](selection.md) | `'default'` |
| [`mode`](mode.md) | `'default'` |

### Exceptions

None.

## Examples

```js
const config = new PHPickerConfiguration();
console.log(config.selectionLimit, config.filter);
```

**Result**: prints `1 null`.

## Corresponding iOS API

`-[PHPickerConfiguration init]`.

## See also

- [`PHPickerViewController()`](../photos/constructor.md): creating a photo picker with a configuration
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
