---
type: reference
native: "-[UISearchBar init]"
---

# `UISearchBar()` constructor

The **`UISearchBar()`** constructor creates a search bar.

## Syntax

```
new UISearchBar()
```

### Parameters

None.

### Return value

A new `UISearchBar`. Its `frame` is 0 × 0 and its [`text`](text.md) is the empty string. The height it wants is 64 pt; see [Size](../ui-search-bar.md#size).

### Exceptions

**`TypeError`**

`UISearchBar` can't be subclassed: `class X extends UISearchBar` throws on `new X()`. See [native classes](../native-classes.md#no-subclassing).

## Examples

```js
const search = new UISearchBar();
console.log(JSON.stringify(search.text));
console.log(search.intrinsicContentSize.height);
```

**Result**: Prints `""` and then `64`.

## Corresponding iOS API

`[[UISearchBar alloc] init]`.

## See also

- [Size](../ui-search-bar.md#size): why a new search bar is invisible
