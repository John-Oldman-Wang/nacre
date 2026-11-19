---
type: reference
native: "-[NSMutableAttributedString setAttributedString:]"
---

# `NSMutableAttributedString`: `setAttributedString()` method

The **`setAttributedString()`** method replaces the entire content with the content of another attributed string: both the text and the attributes are replaced.

## Syntax

```
setAttributedString(other)
```

### Parameters

**`other`**

An `NSAttributedString`. Later changes to `other` don't affect this one.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`other` is not an `NSAttributedString`: `setAttributedString needs an NSAttributedString, got …`.

## Examples

```js
const text = new NSMutableAttributedString('old', { kern: 3 });
text.setAttributedString(new NSAttributedString('new'));
console.log(text.string, text.attribute('kern', { atIndex: 0 }));
```

**Result**: The console logs `new null`.

## Corresponding iOS API

`-[NSMutableAttributedString setAttributedString:]`.

## See also

- [`replaceCharactersInRange()`](replacecharactersinrange.md)
