---
type: reference
native: NSLocale
---

# `NSLocale`

**`NSLocale`** represents a locale: a language, plus a country or region, and the formats that go with them — currency, decimal and grouping separators, calendar, quotation marks, and metric or imperial units.

Read the user's settings from three static properties:

- [`NSLocale.preferredLanguages`](ns-locale/preferredlanguages.md): the languages the user has ordered in Settings.
- [`NSLocale.currentLocale`](ns-locale/currentlocale.md): the locale the app uses. The language is the one the app actually uses, picked from the languages the app declares it supports; the country or region and the formats are what the user set in Settings.
- [`NSLocale.autoupdatingCurrentLocale`](ns-locale/autoupdatingcurrentlocale.md): the same, but its values follow changes to the user's settings.

iOS splits language and region into two separate settings, so a user can set "language English, region China". "Which language to show the interface in" and "which format to write amounts and dates in" therefore come from different places: the former from the language of `currentLocale`, the latter from its region and formats.

When the user changes the region settings, [`application`](application.md) fires the [`localechange`](application/localechange-event.md) event.

**Inheritance**: `EventTarget` → `NSObject` → `NSLocale`

## Constructor

[`NSLocale()`](ns-locale/constructor.md)

Creates a locale from a locale identifier, for example `new NSLocale('de_DE')`.

## Static properties

| Property | Description |
| --- | --- |
| [`preferredLanguages`](ns-locale/preferredlanguages.md) <small>read-only</small> | The languages the user has ordered in Settings |
| [`currentLocale`](ns-locale/currentlocale.md) <small>read-only</small> | The locale the app uses, as of the moment it is read |
| [`autoupdatingCurrentLocale`](ns-locale/autoupdatingcurrentlocale.md) <small>read-only</small> | The locale the app uses, with values that follow the settings |
| [`systemLocale`](ns-locale/systemlocale.md) <small>read-only</small> | A generic locale that belongs to no language or region |
| [`availableLocaleIdentifiers`](ns-locale/availablelocaleidentifiers.md) <small>read-only</small> | Every locale identifier the system recognizes |
| [`ISOLanguageCodes`](ns-locale/isolanguagecodes.md) <small>read-only</small> | Every language code |
| [`ISOCountryCodes`](ns-locale/isocountrycodes.md) <small>read-only</small> | Every country and region code |
| [`ISOCurrencyCodes`](ns-locale/isocurrencycodes.md) <small>read-only</small> | Every currency code |
| [`commonISOCurrencyCodes`](ns-locale/commonisocurrencycodes.md) <small>read-only</small> | Commonly used currency codes |

## Static methods

| Method | Description |
| --- | --- |
| [`localeWithLocaleIdentifier()`](ns-locale/localewithlocaleidentifier.md) | Creates a locale from a locale identifier, same as `new` |
| [`canonicalLocaleIdentifierFromString()`](ns-locale/canonicallocaleidentifierfromstring.md) | Rewrites a locale identifier with canonical capitalization |
| [`canonicalLanguageIdentifierFromString()`](ns-locale/canonicallanguageidentifierfromstring.md) | Rewrites a locale identifier as a canonical language identifier |
| [`characterDirectionForLanguage()`](ns-locale/characterdirectionforlanguage.md) | The direction a language's characters run within a line |
| [`lineDirectionForLanguage()`](ns-locale/linedirectionforlanguage.md) | The direction a language's lines are laid out |

## Instance properties

Also inherits the properties of `NSObject`. All of the properties below are read-only.

Language and region:

| Property | Description |
| --- | --- |
| [`localeIdentifier`](ns-locale/localeidentifier.md) | The locale identifier, such as `'de_DE'` |
| [`languageCode`](ns-locale/languagecode.md) | The language code, such as `'de'` |
| [`languageIdentifier`](ns-locale/languageidentifier.md) | The language identifier, such as `'de-DE'` |
| [`regionCode`](ns-locale/regioncode.md) | The country or region code, such as `'DE'`; may be `null` |
| [`scriptCode`](ns-locale/scriptcode.md) | The script code, such as `'Hant'`; may be `null` |
| [`variantCode`](ns-locale/variantcode.md) | The variant code; may be `null` |

Formats:

| Property | Description |
| --- | --- |
| [`currencyCode`](ns-locale/currencycode.md) | The currency code, such as `'EUR'`; may be `null` |
| [`currencySymbol`](ns-locale/currencysymbol.md) | The currency symbol, such as `'€'` |
| [`decimalSeparator`](ns-locale/decimalseparator.md) | The decimal separator |
| [`groupingSeparator`](ns-locale/groupingseparator.md) | The grouping (thousands) separator |
| [`usesMetricSystem`](ns-locale/usesmetricsystem.md) | Whether the metric system is used |
| [`calendarIdentifier`](ns-locale/calendaridentifier.md) | The calendar, such as `'gregorian'` |
| [`collationIdentifier`](ns-locale/collationidentifier.md) | The rules for sorting text |
| [`collatorIdentifier`](ns-locale/collatoridentifier.md) | The identifier used when sorting text |
| [`quotationBeginDelimiter`](ns-locale/quotationbegindelimiter.md) | The opening quotation mark |
| [`quotationEndDelimiter`](ns-locale/quotationenddelimiter.md) | The closing quotation mark |
| [`alternateQuotationBeginDelimiter`](ns-locale/alternatequotationbegindelimiter.md) | The opening quotation mark for a quotation nested inside another |
| [`alternateQuotationEndDelimiter`](ns-locale/alternatequotationenddelimiter.md) | The closing quotation mark for a quotation nested inside another |

## Instance methods

These give the name of a code in this locale's language:

| Method | Description |
| --- | --- |
| [`localizedStringForLocaleIdentifier()`](ns-locale/localizedstringforlocaleidentifier.md) | The name of a locale identifier: `'fr_FR'` → `'French (France)'` |
| [`localizedStringForLanguageCode()`](ns-locale/localizedstringforlanguagecode.md) | The name of a language: `'de'` → `'German'` |
| [`localizedStringForCountryCode()`](ns-locale/localizedstringforcountrycode.md) | The name of a country or region: `'JP'` → `'Japan'` |
| [`localizedStringForScriptCode()`](ns-locale/localizedstringforscriptcode.md) | The name of a script: `'Hant'` → `'Traditional Han'` |
| [`localizedStringForVariantCode()`](ns-locale/localizedstringforvariantcode.md) | The name of a variant |
| [`localizedStringForCalendarIdentifier()`](ns-locale/localizedstringforcalendaridentifier.md) | The name of a calendar: `'gregorian'` → `'Gregorian Calendar'` |
| [`localizedStringForCollationIdentifier()`](ns-locale/localizedstringforcollationidentifier.md) | The name of a collation |
| [`localizedStringForCurrencyCode()`](ns-locale/localizedstringforcurrencycode.md) | The name of a currency: `'EUR'` → `'Euro'` |
| [`localizedStringForCollatorIdentifier()`](ns-locale/localizedstringforcollatoridentifier.md) | The name of a collator identifier |

## Events

`NSLocale` fires no events of its own. When the user changes the region settings, the event that fires is [`localechange`](application/localechange-event.md) on [`application`](application.md).

## Examples

### Reading the user's language and region

```js
const locale = NSLocale.currentLocale;
console.log(JSON.stringify(NSLocale.preferredLanguages));
console.log(locale.languageCode, locale.regionCode, locale.currencyCode);
console.log(locale.decimalSeparator, locale.usesMetricSystem);
```

**Result**: running the acceptance app (which supports English only) on the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China) prints three lines:

```
["zh-Hans-CN"]
en CN CNY
. true
```

The preferred language is Chinese, yet the language of `currentLocale` is English: the app supports only English, so the system gives it English.

### Choosing the interface language

When the app ships text in several languages and needs to pick one by the user's preference, walk `preferredLanguages` in order and take the first one the app has:

```js
const supported = ['en', 'zh-Hans', 'ja'];
function pickLanguage() {
  for (const tag of NSLocale.preferredLanguages) {
    const locale = new NSLocale(tag);
    const script = locale.scriptCode;
    const candidates = [script === null ? locale.languageCode : locale.languageCode + '-' + script, locale.languageCode];
    for (const c of candidates) {
      if (supported.includes(c)) return c;
    }
  }
  return supported[0];
}
console.log(pickLanguage());
```

**Result**: when the preferred language is `zh-Hans-CN`, the `scriptCode` of `new NSLocale('zh-Hans-CN')` is `'Hans'`, and the output is `zh-Hans`. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[NSLocale preferredLanguages]` | `NSLocale.preferredLanguages` |
| `[NSLocale currentLocale]` | `NSLocale.currentLocale` |
| `[[NSLocale alloc] initWithLocaleIdentifier:@"de_DE"]` | `new NSLocale('de_DE')` |
| `locale.regionCode` | `locale.regionCode` |
| `locale.countryCode` | `locale.regionCode` |
| `[locale objectForKey:NSLocaleCurrencyCode]` | `locale.currencyCode` |
| `[locale displayNameForKey:NSLocaleLanguageCode value:@"de"]` | `locale.localizedStringForLanguageCode('de')` |
| `NSLocaleLanguageDirectionRightToLeft` | `'rightToLeft'` |
| `NSCurrentLocaleDidChangeNotification` | `application.addEventListener('localechange', …)` |

## See also

- [`Intl.NumberFormat`](intl.md), [`Intl.DateTimeFormat`](intl-date.md): write numbers and dates as text for a locale
- [`localechange`](application/localechange-event.md): the user changed the region settings
- [Configuring the app: name, languages, usage descriptions](../guides/project-config.md): `ios.languages` declares which languages the app supports
- [`application.layoutDirection`](application/layoutdirection.md): whether the interface runs left to right or right to left
