---
type: reference
---

# `Intl.NumberFormat`: `resolvedOptions()` method

The **`resolvedOptions()`** method returns the locale and options this formatting object actually uses, with defaults filled in.

## Syntax

```
resolvedOptions()
```

### Parameters

None.

### Return value

A new plain object. Changing it doesn't affect formatting.

- The members and their order are the same as in the browser: `locale`, `numberingSystem`, `style`, `currency`, `currencyDisplay`, `currencySign`, `minimumIntegerDigits`, the two fraction-digit or significant-digit members, `useGrouping`, `notation`, `compactDisplay`, `signDisplay`, `roundingIncrement`, `roundingMode`, `roundingPriority`, `trailingZeroDisplay`.
- Members unrelated to the current `style` don't appear.
- When `useGrouping` was written as `true`, it reads back as `'always'`.
- `locale` is the locale actually used. When no locale was given, it's the system's preferred language.

### Exceptions

**`TypeError`**

Called on a value that isn't an `Intl.NumberFormat`: `Intl.NumberFormat.prototype.resolvedOptions called on a value that is not an Intl.NumberFormat`.

## Examples

```js
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'usd' });
const resolved = usd.resolvedOptions();
console.log(resolved.locale, resolved.currency, resolved.maximumFractionDigits);
```

**Result**: the console prints `en-US USD 2`.

## Differences from the web

Same as the web.

## See also

- [Constructor](constructor.md)
- [Which locale is used when none is specified](../intl.md#which-locale-is-used-when-none-is-specified)
