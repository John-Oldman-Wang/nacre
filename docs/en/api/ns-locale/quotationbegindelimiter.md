---
type: reference
native: NSLocale.quotationBeginDelimiter
---

# `NSLocale`: `quotationBeginDelimiter` property

The **`quotationBeginDelimiter`** property is this locale's opening quotation mark.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- `de_DE` reads `„`.

## Examples

```js
console.log(new NSLocale('de_DE').quotationBeginDelimiter);
```

**Result**: prints `„`.

## Corresponding iOS API

`NSLocale.quotationBeginDelimiter`.

## See also

- [`NSLocale`](../ns-locale.md)
