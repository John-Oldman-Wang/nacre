---
type: reference
native: "-[NSMutableAttributedString initWithString:attributes:]"
---

# `NSMutableAttributedString()` constructor

The **`NSMutableAttributedString()`** constructor creates a mutable attributed string.

## Syntax

```
new NSMutableAttributedString()
new NSMutableAttributedString(string)
new NSMutableAttributedString(string, attributes)
new NSMutableAttributedString(other)
```

### Parameters

Same as [`NSAttributedString()`](../ns-attributed-string/constructor.md):

**`string`**

The text. Converted as a string: the number `5` gives `'5'`, and `null` and `undefined` give an empty string.

**`attributes`**

Optional. A set of [attributes](../ns-attributed-string.md#attributed-string-attributes) for the entire text. Passing `null` is the same as omitting it.

**`other`**

Another `NSAttributedString`. A copy is made from it; later changes to the new one don't affect `other`.

### Return value

A new `NSMutableAttributedString`.

### Exceptions

**`TypeError`**

Same as [`NSAttributedString()`](../ns-attributed-string/constructor.md): `attributes` is not an object, an attribute name is misspelled, an attribute value is of the wrong class, or a color value is `null`. It cannot be subclassed.

## Examples

```js
const text = new NSMutableAttributedString('Price ', {
  font: UIFont.systemFontOfSize(15),
  foregroundColor: 'label',
});
text.appendAttributedString(new NSAttributedString('¥128', {
  font: UIFont.boldSystemFontOfSize(26),
  foregroundColor: 'systemRed',
}));
console.log(text.string);
```

**Result**: The console logs `Price ¥128`.

## Corresponding iOS API

`-[NSMutableAttributedString initWithString:attributes:]` and others, the same four initializers as `NSAttributedString`.

## See also

- [`NSAttributedString()`](../ns-attributed-string/constructor.md)
