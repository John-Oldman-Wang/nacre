---
type: reference
native: PHPickerFilter.depthEffectPhotosFilter
---

# `PHPickerFilter.depthEffectPhotosFilter` static property

The **`PHPickerFilter.depthEffectPhotosFilter`** static property is a predefined filter that shows only photos with a depth effect (taken in Portrait mode).

## Value

A `PHPickerFilter`.

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object, so you can compare it with `===`.
- You can combine it with other filters; see [`anyFilterMatchingSubfilters()`](anyfiltermatchingsubfilters.md), [`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md), and [`notFilterOfSubfilter()`](notfilterofsubfilter.md).

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.depthEffectPhotosFilter;
console.log(PHPickerFilter.depthEffectPhotosFilter === PHPickerFilter.depthEffectPhotosFilter);
```

**Effect**: The console prints `true`. A photo picker created with this configuration shows only photos taken in Portrait mode. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`PHPickerFilter.depthEffectPhotosFilter`.

## See also

- [`PHPickerFilter`](../ph-picker-filter.md): all filters and how to compare them
- [`filter`](../ph-picker-configuration/filter.md): the configuration property that holds the filter
- This class belongs to the `@nacrejs/photos` package; see [Installation](../photos.md#installation)
