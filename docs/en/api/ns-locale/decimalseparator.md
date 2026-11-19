---
type: reference
native: NSLocale.decimalSeparator
---

# `NSLocale`: `decimalSeparator` property

The **`decimalSeparator`** property is the decimal separator this locale uses when writing numbers.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- `de_DE` reads `,`. `en_US` reads `.`.

To write a number as text, use [`Intl.NumberFormat`](../intl.md); it places the decimal and grouping separators for the locale, so there is no need to assemble them yourself.

## Examples

```js
console.log(new NSLocale('de_DE').decimalSeparator);
```

**Result**: prints `,`.

## Corresponding iOS API

`NSLocale.decimalSeparator`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`Intl.NumberFormat`](../intl.md)
