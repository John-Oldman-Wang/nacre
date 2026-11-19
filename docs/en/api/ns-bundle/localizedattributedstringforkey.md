---
type: reference
native: "-[NSBundle localizedAttributedStringForKey:value:table:]"
---

# `NSBundle`: `localizedAttributedStringForKey()` method

The **`localizedAttributedStringForKey()`** method reads a translation like [`localizedStringForKey()`](localizedstringforkey.md), but turns Markdown in the translation into an attributed string.

## Syntax

```
localizedAttributedStringForKey(key[, { value, table }])
```

## Parameters

**`key`**

The key, a string. Converted as a string: numbers become strings, and `null` and `undefined` become an empty string.

**`options.value`**, **`options.table`**

Same as `localizedStringForKey()`.

## Return value

An [`NSAttributedString`](../ns-attributed-string.md).

## Exceptions

None.

## Description

Which attributes the Markdown in a translation turns into is **not verified in the simulator**: the acceptance tests only read values without Markdown.

## Examples

```js
const text = NSBundle.mainBundle.localizedAttributedStringForKey('nacre.missing', { value: 'plain' });
console.log(text.string);
```

**Result**: Prints `plain`.

## Corresponding iOS API

`-[NSBundle localizedAttributedStringForKey:value:table:]`.

## See also

- [`NSBundle`](../ns-bundle.md)
