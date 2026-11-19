---
type: reference
native: "+[PHPickerFilter allFilterMatchingSubfilters:]"
---

# `PHPickerFilter.allFilterMatchingSubfilters()` static method

The **`PHPickerFilter.allFilterMatchingSubfilters()`** static method combines filters into a new filter that shows only items matching every subfilter.

## Syntax

```
PHPickerFilter.allFilterMatchingSubfilters(subfilters)
```

### Parameters

**`subfilters`**

An array of `PHPickerFilter`, with at least one element. Any iterable works (a `Set`, for example). Subfilters can themselves be combinations, and combinations can be nested.

### Return value

A new `PHPickerFilter`. Every call returns a new object; compare with [`isEqual()`](isequal.md).

### Exceptions

**`TypeError`**

- An empty array: `allFilterMatchingSubfilters needs at least one PHPickerFilter`.
- Not an iterable: `allFilterMatchingSubfilters needs an array of PHPickerFilter, got an object`.
- An element that isn't a `PHPickerFilter`: `allFilterMatchingSubfilters: subfilters[1] must be a PHPickerFilter, got "videos"`.

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.allFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.screenshotsFilter),
]);
```

**Effect**: The photo picker shows photos, but no screenshots and no videos. **Not verified in the simulator.**

## Corresponding iOS API

`+[PHPickerFilter allFilterMatchingSubfilters:]`.

## See also

- [`anyFilterMatchingSubfilters()`](anyfiltermatchingsubfilters.md): matches any one
- [`notFilterOfSubfilter()`](notfilterofsubfilter.md): negation
- This class belongs to the `@nacrejs/photos` package; see [Installation](../photos.md#installation)
