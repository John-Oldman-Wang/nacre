---
type: reference
---

# `Intl.NumberFormat.supportedLocalesOf()` static method

The **`Intl.NumberFormat.supportedLocalesOf()`** static method picks out the given locales for which the system has data.

## Syntax

```
Intl.NumberFormat.supportedLocalesOf(locales)
```

### Parameters

**`locales`**

A locale tag, or an array of locale tags. The rules are the same as for the [constructor](constructor.md).

### Return value

An array of strings: locale tags in canonical form. Locales for which the system has no data aren't included.

### Exceptions

The same as the items about `locales` in the [constructor](constructor.md#exceptions).

## Examples

```js
console.log(JSON.stringify(Intl.NumberFormat.supportedLocalesOf(['zh-CN', 'xx', 'en-us'])));
```

**Result**: the console prints `["zh-CN","en-US"]`.

## Differences from the web

"The system has data" means iOS has data for the locale. Everything else is the same as on the web.

## See also

- [`Intl.getCanonicalLocales()`](getcanonicallocales.md): only changes casing, doesn't filter
