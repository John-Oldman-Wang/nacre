---
type: reference
native: NSLocale.alternateQuotationBeginDelimiter
---

# `NSLocale`: `alternateQuotationBeginDelimiter` property

The **`alternateQuotationBeginDelimiter`** property is the opening quotation mark this locale uses for a quotation nested inside another.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- `de_DE` reads `‚`.

## Examples

```js
console.log(new NSLocale('de_DE').alternateQuotationBeginDelimiter);
```

**Result**: prints `‚`.

## Corresponding iOS API

`NSLocale.alternateQuotationBeginDelimiter`.

## See also

- [`NSLocale`](../ns-locale.md)
