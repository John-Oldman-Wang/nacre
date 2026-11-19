---
type: reference
native: "-[NSMutableAttributedString appendAttributedString:]"
---

# `NSMutableAttributedString`: `appendAttributedString()` method

The **`appendAttributedString()`** method appends another attributed string to the end, along with its attributes.

## Syntax

```
appendAttributedString(other)
```

### Parameters

**`other`**

An `NSAttributedString`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`other` is not an `NSAttributedString`: `appendAttributedString needs an NSAttributedString, got "尾巴"`.

## Examples

```js
const text = new NSMutableAttributedString('Rating ');
text.appendAttributedString(new NSAttributedString('4.8', { kern: 1 }));
console.log(text.string);
```

**Result**: The console logs `Rating 4.8`.

## Corresponding iOS API

`-[NSMutableAttributedString appendAttributedString:]`.

## See also

- [`insertAttributedString()`](insertattributedstring.md)
