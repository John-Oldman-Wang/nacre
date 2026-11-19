---
type: reference
native: "-[NSAttributedString initWithString:attributes:]"
---

# `NSAttributedString()` constructor

The **`NSAttributedString()`** constructor creates an attributed string. Once created, its content can't be changed.

## Syntax

```
new NSAttributedString()
new NSAttributedString(string)
new NSAttributedString(string, attributes)
new NSAttributedString(other)
```

### Parameters

**`string`**

The text. Converted to a string: the number `5` gives `'5'`; `null` and `undefined` give an empty string.

**`attributes`**

Optional. A set of [attributes](../ns-attributed-string.md#attributed-string-attributes) for the whole text, an object whose keys are attribute names. `null` is the same as omitting it. Keys whose value is `undefined` are treated as absent.

**`other`**

Another `NSAttributedString`. A copy of it is made, with the same text and attributes.

### Return value

A new `NSAttributedString`:

| Form | Result |
| --- | --- |
| `new NSAttributedString()` | An attributed string with no text |
| `new NSAttributedString(string)` | Text without attributes |
| `new NSAttributedString(string, attributes)` | Text with one set of attributes throughout |
| `new NSAttributedString(other)` | A copy of another attributed string |

### Exceptions

**`TypeError`**

- `attributes` is neither an object nor `null`: `new NSAttributedString: attributes must be an object or null, got …`.
- An attribute name is misspelled: `NSAttributedString has no attribute "colour"; expected one of: font / paragraphStyle / …`.
- A font, paragraph style, shadow, or attachment isn't the corresponding class: for example, `font must be a UIFont, got "Helvetica"`.
- A color value is `null`: `foregroundColor must be a color string or a UIColor, got null`.
- A line style isn't an array, or a line style name is misspelled; see [Line styles](../ns-attributed-string.md#line-styles).
- `NSAttributedString` can't be subclassed: `class X extends NSAttributedString {}` throws at `new X()`; see [Native classes](../native-classes.md).

A misspelled color string doesn't throw: a warning is printed, that key has no effect, and the other keys apply as usual.

## Examples

```js
const text = new NSAttributedString('Notice', {
  font: UIFont.boldSystemFontOfSize(17),
  foregroundColor: '#ff3b30',
  kern: 2,
});
console.log(text.string, text.length);
```

**Result**: The console prints `Notice 6`. It displays as six red bold letters, with 2 pt more space than usual between them (**not verified in the simulator**).

## Corresponding iOS API

`-[NSAttributedString init]`, `-initWithString:`, `-initWithString:attributes:`, `-initWithAttributedString:`. The attribute dictionary key `NSFontAttributeName` is written `font`, and the rest likewise.

## See also

- [Attributed string attributes](../ns-attributed-string.md#attributed-string-attributes)
- [`NSMutableAttributedString()`](../ns-mutable-attributed-string/constructor.md)
