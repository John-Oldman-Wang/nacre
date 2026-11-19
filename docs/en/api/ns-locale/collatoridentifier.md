---
type: reference
native: NSLocale.collatorIdentifier
---

# `NSLocale`: `collatorIdentifier` property

The **`collatorIdentifier`** property is the identifier this locale uses when sorting text.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- `new NSLocale('de_DE')` reads `'de_DE'`.

## Examples

```js
console.log(new NSLocale('de_DE').collatorIdentifier);
```

**Result**: prints `de_DE`.

## Corresponding iOS API

`NSLocale.collatorIdentifier`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForCollatorIdentifier()`](localizedstringforcollatoridentifier.md)
