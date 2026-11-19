---
type: reference
native: "+[NSBundle preferredLocalizationsFromArray:forPreferences:]"
---

# `NSBundle.preferredLocalizationsFromArray()` static method

The **`preferredLocalizationsFromArray()`** static method picks the languages from a list that best match the user's preferences.

## Syntax

```
NSBundle.preferredLocalizationsFromArray(localizationsArray[, { forPreferences }])
```

## Parameters

**`localizationsArray`**

The available languages, an array of strings, such as `['en', 'zh-Hans']`. Each item is converted as a string.

**`options.forPreferences`**

Which set of preferences to pick by, an array of strings, such as `['zh-Hans-CN']`. When omitted or `null`, the user's preferences in system settings are used.

## Return value

An array of strings: the languages picked, best match first, with at least one item.

## Exceptions

**`TypeError`**

- `localizationsArray` is not an array: `preferredLocalizationsFromArray needs an array of strings`.
- `forPreferences` is neither an array nor `null`: `forPreferences needs an array of strings`.

## Description

When the app ships its own text in several languages, use this to pick the interface language: pass in the languages you ship and take the first item. It uses the same rules the system uses to pick a language for the app.

## Examples

```js
console.log(NSBundle.preferredLocalizationsFromArray(['en', 'zh-Hans'], { forPreferences: ['zh-Hans-CN'] })[0]);
```

**Result**: Prints `zh-Hans`.

## Corresponding iOS API

Depending on whether `forPreferences` is given, calls `preferredLocalizationsFromArray:` or `preferredLocalizationsFromArray:forPreferences:`.

## See also

- [`NSBundle`](../ns-bundle.md)
