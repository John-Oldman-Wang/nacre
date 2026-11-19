---
type: reference
native: "-[NSLocale localizedStringForLanguageCode:]"
---

# `NSLocale`: `localizedStringForLanguageCode()` method

The **`localizedStringForLanguageCode()`** method gives the name of a language code in this locale's language.

## Syntax

```
localizedStringForLanguageCode(languageCode)
```

## Parameters

**`languageCode`**

A language code, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language. May be `null` when the code is not recognized. **Which codes give `null` is not verified in the simulator.**

## Exceptions

None.

## Description

Which language the name is given in depends on the locale object it is called on: `new NSLocale('zh_Hans_CN').localizedStringForLanguageCode('en')` gives `英语`. In a language-switching menu, give each language its name in that language itself, so users can find it: `new NSLocale(code).localizedStringForLanguageCode(code)`.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForLanguageCode('de'));
```

**Result**: prints `German`.

## Corresponding iOS API

`-[NSLocale localizedStringForLanguageCode:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`languageCode`](languagecode.md)
