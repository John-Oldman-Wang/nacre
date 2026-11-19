---
type: reference
native: PHPickerFilter.screenshotsFilter
---

# `PHPickerFilter.screenshotsFilter` static property

The **`PHPickerFilter.screenshotsFilter`** static property is a predefined filter that shows only screenshots.

## Value

A `PHPickerFilter`.

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object, so you can compare it with `===`.
- You can combine it with other filters; see [`anyFilterMatchingSubfilters()`](anyfiltermatchingsubfilters.md), [`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md), and [`notFilterOfSubfilter()`](notfilterofsubfilter.md).

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.screenshotsFilter;
console.log(PHPickerFilter.screenshotsFilter === PHPickerFilter.screenshotsFilter);
```

**Effect**: The console prints `true`. A photo picker created with this configuration shows only screenshots. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`PHPickerFilter.screenshotsFilter`.

## See also

- [`PHPickerFilter`](../ph-picker-filter.md): all filters and how to compare them
- [`filter`](../ph-picker-configuration/filter.md): the configuration property that holds the filter
- This class belongs to the `@nacrejs/photos` package; see [Installation](../photos.md#installation)
