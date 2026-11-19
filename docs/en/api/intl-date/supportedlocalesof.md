---
type: reference
---

# `Intl.DateTimeFormat.supportedLocalesOf()` static method

The **`Intl.DateTimeFormat.supportedLocalesOf()`** static method picks out the given locales that the system has data for.

## Syntax

```
Intl.DateTimeFormat.supportedLocalesOf(locales)
```

### Parameters

**`locales`**

A locale tag, or an array of locale tags. For the rules, see [Locale tags](../intl.md#locale-tags).

### Return value

An array of strings: the locale tags in canonical form.

### Exceptions

The same as the items about `locales` in the [constructor](constructor.md#exceptions).

## Examples

```js
console.log(JSON.stringify(Intl.DateTimeFormat.supportedLocalesOf(['zh-CN', 'xx', 'en-us'])));
```

**Result**: the console prints `["zh-CN","en-US"]`. **This output is not verified in the simulator**; `Intl.NumberFormat.supportedLocalesOf()` gives this result for the same arguments in the acceptance tests.

## Differences from the web

Same as on the web.

## See also

- [`Intl.NumberFormat.supportedLocalesOf()`](../intl/supportedlocalesof.md)
