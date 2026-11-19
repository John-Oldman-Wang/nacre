---
type: reference
---

# `Intl.getCanonicalLocales()` static method

The **`Intl.getCanonicalLocales()`** static method changes locale tags to canonical casing. It's a function of `Intl` itself and doesn't belong to `Intl.NumberFormat`.

## Syntax

```
Intl.getCanonicalLocales(locales)
```

### Parameters

**`locales`**

A locale tag, or an array of locale tags.

### Return value

An array of strings, with each locale tag changed to canonical casing.

Only the casing changes; old forms aren't replaced with new ones (`'iw'` doesn't become `'he'`). **This is not verified in the simulator**; it comes from the code.

### Exceptions

**`RangeError`**

Not a valid locale tag: `invalid language tag: en_US`, ending with the tag.

## Examples

```js
console.log(JSON.stringify(Intl.getCanonicalLocales(['EN-us', 'zh-hans-cn'])));
```

**Result**: the console prints `["en-US","zh-Hans-CN"]`.

## Differences from the web

Browsers replace old forms with new ones (`'iw'` becomes `'he'`); this doesn't. **Not verified in the simulator.**

## See also

- [Locale tags](../intl.md#locale-tags)
