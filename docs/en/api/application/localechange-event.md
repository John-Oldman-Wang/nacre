---
type: reference
native: NSCurrentLocaleDidChangeNotification
---

# `Application`: `localechange` event

The **`localechange`** event fires when the user changes the region settings: country or region, currency, number and date formats, metric or imperial.

## Syntax

```
application.addEventListener('localechange', (event) => { })
```

## Event object

`Event`. `target` is `application`. It doesn't carry the new values; read [`NSLocale.currentLocale`](../ns-locale/currentlocale.md) again in the callback. Not cancelable.

## When it fires

- When the user changes region settings such as the region, calendar, or temperature unit in Settings. **Not verified in the simulator.**
- When the user changes the system language, iOS terminates the running app; the app doesn't receive this event and reads the new language on the next launch. **Not verified in the simulator.**
- The callback doesn't run synchronously at the moment of the change; it runs later. See [How the runtime works](../how-it-works.md#events).

When no locale is specified, `Intl.NumberFormat` and `Intl.DateTimeFormat` use the preferred language and aren't affected by the region settings. To format amounts for the user's region, read the currency code from `NSLocale.currentLocale` yourself, and read it again in this event.

## Examples

```js
function showCurrency() {
  console.log(NSLocale.currentLocale.currencyCode);
}
showCurrency();
application.addEventListener('localechange', showCurrency);
```

**Effect**: prints the currency code once at launch. After the user changes the region from China to Japan in Settings and returns to the app, it prints again, now `JPY`. **Not verified in the simulator.**

## Corresponding iOS API

`NSCurrentLocaleDidChangeNotification`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`Application`](../application.md#events)
