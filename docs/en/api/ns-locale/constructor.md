---
type: reference
native: "-[NSLocale initWithLocaleIdentifier:]"
---

# `NSLocale()` constructor

The **`NSLocale()`** constructor creates a locale object from a locale identifier.

## Syntax

```
new NSLocale(localeIdentifier)
```

## Parameters

**`localeIdentifier`**

A locale identifier, a string, such as `'de_DE'`, `'zh_Hant_CN'`, or `'en-US'`. Both underscore and hyphen forms are accepted. Converted as a string: `null` and `undefined` become the empty string.

How an identifier is written: the language code comes first, followed in order by the script code, the country or region code, and the variant; at the end it can carry options such as `@calendar=japanese` or `@collation=phonebook`.

## Return value

A new `NSLocale`.

## Exceptions

None.

## Description

When the identifier is written with underscores, the system drops the script that is the default for that language and region, and the identifier changes accordingly: for `new NSLocale('zh_Hans_CN')`, [`localeIdentifier`](localeidentifier.md) is `'zh_CN'` and [`scriptCode`](scriptcode.md) is `null`. When it is written with hyphens (`'zh-Hant-TW'`), the script is kept. This is measured behavior; Apple's documentation does not say so.

## Examples

```js
const de = new NSLocale('de_DE');
console.log(de.currencyCode, de.decimalSeparator);
```

**Result**: prints `EUR ,`.

## Corresponding iOS API

`-[NSLocale initWithLocaleIdentifier:]`.

## See also

- [`NSLocale.localeWithLocaleIdentifier()`](localewithlocaleidentifier.md)
- [`NSLocale.currentLocale`](currentlocale.md): the user's own region settings, with no need to create a locale yourself
