---
type: reference
native: NSLocale.currencySymbol
---

# `NSLocale`: `currencySymbol` property

The **`currencySymbol`** property is this locale's currency symbol.

## Value

A string, such as `'€'` or `'$'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.

## Examples

```js
console.log(new NSLocale('de_DE').currencySymbol);
```

**Result**: prints `€`.

## Corresponding iOS API

`NSLocale.currencySymbol`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`currencyCode`](currencycode.md)
