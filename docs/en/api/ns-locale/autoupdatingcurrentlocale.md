---
type: reference
native: NSLocale.autoupdatingCurrentLocale
---

# `NSLocale.autoupdatingCurrentLocale` static property

The **`autoupdatingCurrentLocale`** static property is the locale the app uses, with values that follow the user's settings.

## Value

[`NSLocale`](../ns-locale.md).

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- Its values are the same as [`currentLocale`](currentlocale.md); the difference is that after the user changes the region settings, reading this object's properties again gives the new values. **That it follows changes is not verified in the simulator**; it comes from Apple's documentation.
- It fires no events of its own. To refresh the interface when the settings change, listen for [`localechange`](../application/localechange-event.md).

## Examples

```js
console.log(NSLocale.autoupdatingCurrentLocale.localeIdentifier);
```

**Result**: prints `en_CN` on the iPhone Air simulator (iOS 27.2, system language Simplified Chinese, region China).

## Corresponding iOS API

`NSLocale.autoupdatingCurrentLocale` (a class property).

## See also

- [`currentLocale`](currentlocale.md)
- [`localechange`](../application/localechange-event.md)
