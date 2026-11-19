---
type: reference
native: PHPickerConfiguration.filter
---

# `PHPickerConfiguration`: `filter` property

The **`filter`** property indicates which types are shown in the photo picker.

## Value

A [`PHPickerFilter`](../ph-picker-filter.md), or `null`.

- Readable and writable.
- Defaults to `null`: all types are shown, including videos.
- What you read back isn't the object you wrote: the system stores a copy. Compare with [`isEqual()`](../ph-picker-filter/isequal.md).
- Only the app can change it; there's no change notification.

When you only want images, set it to `PHPickerFilter.imagesFilter`: selected videos can't be retrieved yet.

### Invalid values

Writing a value that's neither a `PHPickerFilter` nor `null` throws `TypeError`.

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.imagesFilter;
console.log(config.filter === PHPickerFilter.imagesFilter);
console.log(config.filter !== null && config.filter.isEqual(PHPickerFilter.imagesFilter));
```

**Result**: the first line prints `false`, and the second prints `true`.

## Corresponding iOS API

`PHPickerConfiguration.filter`.

## See also

- [`PHPickerFilter`](../ph-picker-filter.md): ready-made filters and how to combine them
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
