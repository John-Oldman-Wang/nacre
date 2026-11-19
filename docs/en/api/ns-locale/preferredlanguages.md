---
type: reference
native: NSLocale.preferredLanguages
---

# `NSLocale.preferredLanguages` static property

The **`preferredLanguages`** static property is the languages the user has ordered in Settings.

## Value

An array of strings. Each item is a language identifier, such as `'zh-Hans-CN'` or `'en-US'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- The first item is the user's preferred language. There is always at least one item. On the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China), it is `['zh-Hans-CN']`.
- Each read returns a new array.
- When the user changes the system language, iOS terminates the running app, and the next launch reads the new list. **Not verified in the simulator.**

It is the user's preference, not the language the app actually uses. The system picks the language the app actually uses from the languages the app declares it supports: when the user prefers Chinese and the app supports only English, the app uses English. The language of [`NSLocale.currentLocale`](currentlocale.md) is the one picked.

When `Intl.NumberFormat` and `Intl.DateTimeFormat` are given no locale, they use the first item of this list.

## Examples

```js
console.log(NSLocale.preferredLanguages);
```

**Result**: prints `['zh-Hans-CN']` on the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China).

## Corresponding iOS API

`NSLocale.preferredLanguages` (a class property).

## See also

- [`currentLocale`](currentlocale.md): the language the app actually uses, and the user's region
- [`Intl.NumberFormat`](../intl.md)
