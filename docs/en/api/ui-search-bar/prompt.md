---
type: reference
native: UISearchBar.prompt
---

# `UISearchBar`: `prompt` property

The **`prompt`** property is a line of descriptive text shown above the text field.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`, which doesn't show the line.
- Writing `''` reads back `''`; writing `null` reads back `null`.
- When it is set, the height the search bar wants goes from 64 pt to 98 pt. When positioning with `frame`, call `sizeToFit()` again after changing it; see [Size](../ui-search-bar.md#size).
- There is no change event: only the app's own code changes it.

## Examples

```js
const search = new UISearchBar();
search.prompt = 'Enter a city name';
console.log(search.intrinsicContentSize.height);
```

**Effect**: A line of small text appears above the text field. The console prints `98`.

## Corresponding iOS API

`UISearchBar.prompt`.

## See also

- [`placeholder`](placeholder.md)
