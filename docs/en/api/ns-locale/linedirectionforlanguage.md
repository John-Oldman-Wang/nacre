---
type: reference
native: "+[NSLocale lineDirectionForLanguage:]"
---

# `NSLocale.lineDirectionForLanguage()` static method

The **`lineDirectionForLanguage()`** static method gives the direction in which a language's lines are laid out.

## Syntax

```
NSLocale.lineDirectionForLanguage(isoLangCode)
```

## Parameters

**`isoLangCode`**

A language code, such as `'en'`. A string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string, with the same possible values as [`characterDirectionForLanguage()`](characterdirectionforlanguage.md).

## Exceptions

None.

## Examples

```js
console.log(NSLocale.lineDirectionForLanguage('en'));
```

**Result**: prints `topToBottom`.

## Corresponding iOS API

`+[NSLocale lineDirectionForLanguage:]`.

## See also

- [`characterDirectionForLanguage()`](characterdirectionforlanguage.md)
