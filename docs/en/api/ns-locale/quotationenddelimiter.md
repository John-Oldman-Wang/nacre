---
type: reference
native: NSLocale.quotationEndDelimiter
---

# `NSLocale`: `quotationEndDelimiter` property

The **`quotationEndDelimiter`** property is this locale's closing quotation mark.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- `de_DE` reads `“`.

## Examples

```js
console.log(new NSLocale('de_DE').quotationEndDelimiter);
```

**Result**: prints `“`.

## Corresponding iOS API

`NSLocale.quotationEndDelimiter`.

## See also

- [`NSLocale`](../ns-locale.md)
