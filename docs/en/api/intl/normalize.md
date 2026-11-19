---
type: reference
---

# `String.prototype.normalize()` method

The **`normalize()`** method converts a string to a Unicode normalization form. It's a method of strings themselves, doesn't belong to `Intl`, and is written the same as in the browser.

The same character can be written in several ways: `é` can be a single character (U+00E9), or `e` followed by a combining mark (U+0065 U+0301). Both look the same on screen, but they aren't equal with `===` and have different `length`. Normalize before comparing, searching, or using as a key, and the two forms become the same string.

## Syntax

```
normalize()
normalize(form)
```

### Parameters

**`form`** <small>optional</small>

One of the following four strings; `'NFC'` if omitted. The names are case-sensitive.

| `form` | What it does | Result for `'ﬁ'` (the ﬁ ligature) |
| --- | --- | --- |
| `'NFC'` | Composes into single characters where possible | Unchanged |
| `'NFD'` | Decomposes into base characters plus combining marks | Unchanged |
| `'NFKC'` | First replaces compatibility characters with ordinary ones, then composes | The two characters `fi` |
| `'NFKD'` | First replaces compatibility characters with ordinary ones, then decomposes | The two characters `fi` |

Compatibility characters include ligatures, circled numbers, full-width letters, and half-width katakana: `'①'.normalize('NFKC')` is `'1'`, and `'ｱ'.normalize('NFKC')` is `'ア'`. `'NFKC'` and `'NFKD'` lose these distinctions; they're suitable for search, but don't use them to store the original text the user typed.

### Return value

A new string; the original is unchanged.

Results match `normalize()` in a web page on the same device item for item. It uses the system's Unicode data, so characters added in newer Unicode versions follow the system version.

### Exceptions

**`RangeError`**

`form` isn't one of the four, including `'nfc'`: `The normalization form should be one of NFC, NFD, NFKC, NFKD.`. Type checking can't catch this error; the type of `form` is `string`.

## Examples

```js
/** @type {string} */
const a = 'café';   // é is one character
const b = 'café';  // e + combining mark
console.log(a === b, a.length, b.length);
console.log(a.normalize() === b.normalize());
console.log(b.normalize().length, a.normalize('NFD').length);
```

**Result**: the console prints `false 4 5`, `true`, and `4 5`.

## Differences from the web

Same as the web.

## See also

- [`Intl.NumberFormat`](../intl.md)
