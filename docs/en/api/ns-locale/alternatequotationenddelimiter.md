---
type: reference
native: NSLocale.alternateQuotationEndDelimiter
---

# `NSLocale`: `alternateQuotationEndDelimiter` property

The **`alternateQuotationEndDelimiter`** property is the closing quotation mark this locale uses for a quotation nested inside another.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- `de_DE` reads `‘`.

## Examples

```js
console.log(new NSLocale('de_DE').alternateQuotationEndDelimiter);
```

**Result**: prints `‘`.

## Corresponding iOS API

`NSLocale.alternateQuotationEndDelimiter`.

## See also

- [`NSLocale`](../ns-locale.md)
