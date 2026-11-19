---
type: reference
native: PHPickerFilter.panoramasFilter
---

# `PHPickerFilter.panoramasFilter` static property

The **`PHPickerFilter.panoramasFilter`** static property is a predefined filter that shows only panoramas.

## Value

A `PHPickerFilter`.

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object, so you can compare it with `===`.
- You can combine it with other filters; see [`anyFilterMatchingSubfilters()`](anyfiltermatchingsubfilters.md), [`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md), and [`notFilterOfSubfilter()`](notfilterofsubfilter.md).

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.panoramasFilter;
console.log(PHPickerFilter.panoramasFilter === PHPickerFilter.panoramasFilter);
```

**Effect**: The console prints `true`. A photo picker created with this configuration shows only panoramas. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`PHPickerFilter.panoramasFilter`.

## See also

- [`PHPickerFilter`](../ph-picker-filter.md): all filters and how to compare them
- [`filter`](../ph-picker-configuration/filter.md): the configuration property that holds the filter
- This class belongs to the `@nacrejs/photos` package; see [Installation](../photos.md#installation)
