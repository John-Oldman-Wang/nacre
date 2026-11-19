---
type: reference
native: NSLocale.languageIdentifier
---

# `NSLocale`: `languageIdentifier` property

The **`languageIdentifier`** property is this locale's language identifier: the language plus the script and the country or region, separated by hyphens.

## Value

A string, such as `'de-DE'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- On the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China), `NSLocale.currentLocale` reads `'en-CN'`.

## Examples

```js
console.log(new NSLocale('de_DE').languageIdentifier);
```

**Result**: prints `de-DE`.

## Corresponding iOS API

`NSLocale.languageIdentifier`.

## See also

- [`NSLocale`](../ns-locale.md)
