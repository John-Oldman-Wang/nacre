---
type: reference
native: "-[PHPickerFilter isEqual:]"
---

# `PHPickerFilter`: `isEqual()` method

The **`isEqual()`** method determines whether two filters mean the same thing.

## Syntax

```
isEqual(other)
```

### Parameters

**`other`**

Any value.

### Return value

A boolean. `true`: the two filters mean the same thing, for example the same combination built twice. `false`: they mean different things, or `other` isn't a `PHPickerFilter` (including `null` and strings).

### Exceptions

None. If `other` isn't a filter, it returns `false` and doesn't throw.

## Description

Use this method to compare filters, not `===`: combined filters are new objects every time, and reading the configuration's [`filter`](../ph-picker-configuration/filter.md) returns a copy. Only the twelve predefined filters return the same object on every read.

## Examples

```js
const a = PHPickerFilter.anyFilterMatchingSubfilters([PHPickerFilter.imagesFilter, PHPickerFilter.videosFilter]);
const b = PHPickerFilter.anyFilterMatchingSubfilters([PHPickerFilter.imagesFilter, PHPickerFilter.videosFilter]);
console.log(a === b, a.isEqual(b));
console.log(a.isEqual(PHPickerFilter.imagesFilter), a.isEqual('imagesFilter'));
```

**Result**: The first line prints `false true`, and the second line prints `false false`.

## Corresponding iOS API

`-[NSObject isEqual:]`.

## See also

- [Comparing two filters](../ph-picker-filter.md#comparing-two-filters)
- This class belongs to the `@nacrejs/photos` package; see [Installation](../photos.md#installation)
