---
type: reference
native: NSLocale.systemLocale
---

# `NSLocale.systemLocale` static property

The **`systemLocale`** static property is a generic locale that belongs to no language or region.

## Value

[`NSLocale`](../ns-locale.md).

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- Its [`localeIdentifier`](localeidentifier.md) is the empty string `''`.
- It is not the user's setting. For the user's setting, read [`currentLocale`](currentlocale.md).

## Examples

```js
console.log(JSON.stringify(NSLocale.systemLocale.localeIdentifier));
```

**Result**: prints `""`.

## Corresponding iOS API

`NSLocale.systemLocale` (a class property).

## See also

- [`NSLocale`](../ns-locale.md)
