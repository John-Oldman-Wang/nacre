---
type: reference
native: PHPickerFilter.spatialMediaFilter
---

# `PHPickerFilter.spatialMediaFilter` static property

The **`PHPickerFilter.spatialMediaFilter`** static property is a predefined filter that shows only spatial photos and spatial videos.

## Value

A `PHPickerFilter`.

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object, so you can compare it with `===`.
- You can combine it with other filters; see [`anyFilterMatchingSubfilters()`](anyfiltermatchingsubfilters.md), [`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md), and [`notFilterOfSubfilter()`](notfilterofsubfilter.md).

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.spatialMediaFilter;
console.log(PHPickerFilter.spatialMediaFilter === PHPickerFilter.spatialMediaFilter);
```

**Effect**: The console prints `true`. A photo picker created with this configuration shows only spatial photos and spatial videos. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`PHPickerFilter.spatialMediaFilter`.

## See also

- [`PHPickerFilter`](../ph-picker-filter.md): all filters and how to compare them
- [`filter`](../ph-picker-configuration/filter.md): the configuration property that holds the filter
- This class belongs to the `@nacrejs/photos` package; see [Installation](../photos.md#installation)
