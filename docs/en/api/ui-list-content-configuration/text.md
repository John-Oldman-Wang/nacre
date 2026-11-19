---
type: reference
native: UIListContentConfiguration.text
---

# `UIListContentConfiguration`: `text` property

The **`text`** property is the primary text of a row.

## Value

A string, or `null`.

- Readable and writable.
- Defaults to `null`.
- Numbers are converted to strings (verified by testing). Writing `null` clears it.
- Changing it does not affect a copy already written to a cell; assign it again. See [A content configuration is a copy](../ui-list-content-configuration.md).

## Examples

```js
const content = UIListContentConfiguration.subtitleCellConfiguration();
content.text = /** @type {any} */ (42);
console.log(content.text);
```

**Result**: logs `42`, as a string.

## Corresponding iOS API

`UIListContentConfiguration.text`.

## See also

- [`secondaryText`](secondarytext.md)
