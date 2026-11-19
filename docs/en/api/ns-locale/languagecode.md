---
type: reference
native: NSLocale.languageCode
---

# `NSLocale`: `languageCode` property

The **`languageCode`** property is this locale's language code.

## Value

A string, an ISO 639 code, such as `'de'` or `'zh'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.

## Examples

```js
console.log(new NSLocale('de_DE').languageCode);
```

**Result**: prints `de`.

## Corresponding iOS API

`NSLocale.languageCode`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForLanguageCode()`](localizedstringforlanguagecode.md)
