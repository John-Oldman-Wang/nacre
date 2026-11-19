---
type: reference
native: "+[PHPickerFilter notFilterOfSubfilter:]"
---

# `PHPickerFilter.notFilterOfSubfilter()` static method

The **`PHPickerFilter.notFilterOfSubfilter()`** static method returns a new filter that shows only items that don't match the subfilter.

## Syntax

```
PHPickerFilter.notFilterOfSubfilter(subfilter)
```

### Parameters

**`subfilter`**

A `PHPickerFilter`. It can be a combination.

### Return value

A new `PHPickerFilter`. Every call returns a new object; compare with [`isEqual()`](isequal.md).

### Exceptions

**`TypeError`**

`subfilter` isn't a `PHPickerFilter`: `notFilterOfSubfilter needs a PHPickerFilter, got null`.

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.videosFilter);
```

**Effect**: The photo picker shows no videos. **Not verified in the simulator.**

## Corresponding iOS API

`+[PHPickerFilter notFilterOfSubfilter:]`.

## See also

- [`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md): combine it with negation to remove one kind from another
- This class belongs to the `@nacrejs/photos` package; see [Installation](../photos.md#installation)
