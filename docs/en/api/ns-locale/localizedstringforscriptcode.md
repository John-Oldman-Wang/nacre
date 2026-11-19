---
type: reference
native: "-[NSLocale localizedStringForScriptCode:]"
---

# `NSLocale`: `localizedStringForScriptCode()` method

The **`localizedStringForScriptCode()`** method gives the name of a script code in this locale's language.

## Syntax

```
localizedStringForScriptCode(scriptCode)
```

## Parameters

**`scriptCode`**

A script code, a string. Converted as a string: numbers become strings, and `null` and `undefined` become the empty string.

## Return value

A string: the name of the code, written in this locale's language. May be `null` when the code is not recognized. **Which codes give `null` is not verified in the simulator.**

## Exceptions

None.

## Examples

```js
console.log(new NSLocale('en_US').localizedStringForScriptCode('Hant'));
```

**Result**: prints `Traditional Han`. `'Hans'` gives `Simplified Han`.

## Corresponding iOS API

`-[NSLocale localizedStringForScriptCode:]`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`scriptCode`](scriptcode.md)
