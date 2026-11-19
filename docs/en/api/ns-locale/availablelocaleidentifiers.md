---
type: reference
native: NSLocale.availableLocaleIdentifiers
---

# `NSLocale.availableLocaleIdentifiers` static property

The **`availableLocaleIdentifiers`** static property is every locale identifier the system recognizes.

## Value

An array of strings.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- Each read returns a new array.
- It contains `'de_DE'`.

## Examples

```js
console.log(NSLocale.availableLocaleIdentifiers.includes('de_DE'));
```

**Result**: prints `true`.

## Corresponding iOS API

`NSLocale.availableLocaleIdentifiers` (a class property).

## See also

- [`NSLocale`](../ns-locale.md)
