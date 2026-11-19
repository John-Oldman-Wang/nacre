---
type: reference
native: UIListContentConfiguration.secondaryText
---

# `UIListContentConfiguration`: `secondaryText` property

The **`secondaryText`** property is the secondary text of a row. Where it appears depends on the style: below the primary text, or to its right.

## Value

A string, or `null`.

- Readable and writable.
- Defaults to `null`.
- Writing `null` clears it.

## Examples

```js
const content = UIListContentConfiguration.subtitleCellConfiguration();
content.text = 'Pour-over kettle';
content.secondaryText = 'Awaiting payment';
```

**Effect**: a gray line "Awaiting payment" below the primary text "Pour-over kettle".

## Corresponding iOS API

`UIListContentConfiguration.secondaryText`.

## See also

- [`text`](text.md)
