---
type: reference
native: NSLocale.currentLocale
---

# `NSLocale.currentLocale` static property

The **`currentLocale`** static property is the locale the app uses at the moment it is read: the language is the one the app actually uses, and the country or region, the currency, and the number and date formats are what the user set in Settings.

## Value

[`NSLocale`](../ns-locale.md).

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- The language is the one the user most prefers among the languages the app declares it supports. An app that does not set `ios.languages` is in English. On the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China), the acceptance app has only English and reads `en_CN`: language English, region China, currency `CNY`.
- The object read does not follow the settings: if the user later changes the region settings, the object keeps the values from the moment it was read. For the latest values, read it again in the [`localechange`](../application/localechange-event.md) event, or use [`autoupdatingCurrentLocale`](autoupdatingcurrentlocale.md).

The languages an app supports are declared in `ios.languages` in `nacre.config.json`; see [Configuring the app: name, languages, usage descriptions](../../guides/project-config.md).

## Examples

```js
const locale = NSLocale.currentLocale;
console.log(locale.localeIdentifier, locale.regionCode, locale.currencyCode);
```

**Result**: prints `en_CN CN CNY` on the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China).

## Corresponding iOS API

`NSLocale.currentLocale` (a class property).

## See also

- [`autoupdatingCurrentLocale`](autoupdatingcurrentlocale.md)
- [`preferredLanguages`](preferredlanguages.md)
- [`localechange`](../application/localechange-event.md)
