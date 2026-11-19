---
type: reference
native: "+[PHPickerFilter anyFilterMatchingSubfilters:]"
---

# `PHPickerFilter.anyFilterMatchingSubfilters()` static method

The **`PHPickerFilter.anyFilterMatchingSubfilters()`** static method combines filters into a new filter that shows every item matching any one of the subfilters.

## Syntax

```
PHPickerFilter.anyFilterMatchingSubfilters(subfilters)
```

### Parameters

**`subfilters`**

An array of `PHPickerFilter`, with at least one element. Any iterable works (a `Set`, for example). Subfilters can themselves be combinations, and combinations can be nested.

### Return value

A new `PHPickerFilter`. Every call returns a new object: if you build the same combination twice, `===` is `false` and [`isEqual()`](isequal.md) is `true`.

### Exceptions

**`TypeError`**

- An empty array: `anyFilterMatchingSubfilters needs at least one PHPickerFilter`.
- Not an iterable, for example a single filter passed directly: `anyFilterMatchingSubfilters needs an array of PHPickerFilter, got an object`.
- An element that isn't a `PHPickerFilter`: `anyFilterMatchingSubfilters: subfilters[1] must be a PHPickerFilter, got "videos"`.

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.anyFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.videosFilter,
]);
```

**Effect**: The photo picker shows images and videos. **Not verified in the simulator.**

## Corresponding iOS API

`+[PHPickerFilter anyFilterMatchingSubfilters:]`.

## See also

- [`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md): matches every one
- [`notFilterOfSubfilter()`](notfilterofsubfilter.md): negation
- This class belongs to the `@nacrejs/photos` package; see [Installation](../photos.md#installation)
