---
type: reference
native: NSLocale.scriptCode
---

# `NSLocale`: `scriptCode` property

The **`scriptCode`** property is this locale's script code.

## Value

A string or `null`. The string is an ISO 15924 code, such as `'Hant'` or `'Latn'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- It is `null` when the identifier does not specify a script.
- When written with underscores and the script given is the default for that language and region, the system drops it, so it is also `null`: `'zh_Hans_CN'` and `'zh_Hant_TW'` both read `null`, `'zh_Hant_CN'` reads `'Hant'`, and `'zh-Hant-TW'`, written with hyphens, reads `'Hant'`. This is measured behavior.

To tell Simplified from Traditional, checking whether this property is `null` is not enough; look at the language and the region as well.

## Examples

```js
console.log(new NSLocale('zh_Hant_CN').scriptCode);
console.log(new NSLocale('zh_Hans_CN').scriptCode);
```

**Result**: prints `Hant`, then `null`.

## Corresponding iOS API

`NSLocale.scriptCode`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForScriptCode()`](localizedstringforscriptcode.md)
