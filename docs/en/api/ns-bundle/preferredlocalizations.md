---
type: reference
native: NSBundle.preferredLocalizations
---

# `NSBundle`: `preferredLocalizations` property

The **`preferredLocalizations`** property is the languages in the bundle actually in use this time, best match for the user's preferences first.

## Value

An array of strings, with at least one item.

- Read-only; assigning to it throws `TypeError`.
- The first item is the language the app is using this time. The system picks it at launch from [`localizations`](localizations.md) according to the user's preferences.
- When running the acceptance app on the iPhone Air simulator (iOS 27.2) (system language Simplified Chinese; the acceptance app only has English), it is `['en']`.
- When the user changes the system language, or picks a language for this app alone in Settings, iOS terminates the running app, and the new value is read at the next launch. **Not verified in the simulator.**

When the app's own interface text lives in JS and must match the language the system picked, read its first item.

## Examples

```js
console.log(NSBundle.mainBundle.preferredLocalizations[0]);
```

**Result**: Prints `en` when running the acceptance app on the iPhone Air simulator (iOS 27.2).

## Corresponding iOS API

`NSBundle.preferredLocalizations`.

## See also

- [`NSBundle`](../ns-bundle.md)
- [`NSLocale.preferredLanguages`](../ns-locale/preferredlanguages.md): the user's preferences, whether or not the app supports them
