---
type: reference
native: NSLocale.localeIdentifier
---

# `NSLocale`: `localeIdentifier` property

The **`localeIdentifier`** property is this locale's identifier.

## Value

A string, such as `'de_DE'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- It is the identifier the locale was created with, except that when written with underscores, the script that is the default for that language and region is dropped: `new NSLocale('zh_Hans_CN')` reads `'zh_CN'`.
- On the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China), `NSLocale.currentLocale` reads `'en_CN'`.

## Examples

```js
console.log(new NSLocale('zh_Hans_CN').localeIdentifier);
```

**Result**: prints `zh_CN`.

## Corresponding iOS API

`NSLocale.localeIdentifier`.

## See also

- [`NSLocale`](../ns-locale.md)
