---
type: reference
native: "-[NSAttributedString isEqualToAttributedString:]"
---

# `NSAttributedString`: `isEqualToAttributedString()` method

The **`isEqualToAttributedString()`** method compares the content of two attributed strings: they are equal only if the text and the attributes everywhere are the same.

An attributed string read back from a view is a snapshot, and each read may be a different object, so compare content with this method rather than `===`.

## Syntax

```
isEqualToAttributedString(other)
```

### Parameters

**`other`**

Another `NSAttributedString`.

### Return value

A boolean: `true` if the text and the attributes everywhere are the same, otherwise `false`.

### Exceptions

**`TypeError`**

`other` isn't an `NSAttributedString`: `isEqualToAttributedString needs an NSAttributedString, got …`.

## Examples

```js
const text = new NSAttributedString('Sale', { underlineStyle: ['single'] });
const label = new UILabel();
label.attributedText = text;
const back = label.attributedText;
console.log(back !== null && back.isEqualToAttributedString(text));
```

**Result**: The console prints `true`. **Not verified in the simulator.**

## Corresponding iOS API

`-[NSAttributedString isEqualToAttributedString:]`.

## See also

- [`UILabel.attributedText`](../ui-label/attributedtext.md)
