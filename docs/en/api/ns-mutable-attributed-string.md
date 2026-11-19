---
type: reference
native: NSMutableAttributedString
status: partial
---

# `NSMutableAttributedString`

**`NSMutableAttributedString`** represents a mutable [attributed string](ns-attributed-string.md): you can add attributes to a range, remove attributes, and append, insert, replace, and delete text.

It has all the members of [`NSAttributedString`](ns-attributed-string.md) and is created the same way, plus the modifying methods below. None of the modifying methods returns a value; they throw `TypeError` when a range is out of bounds, a required option is missing, or an argument has the wrong type.

A view takes the content as it is at the moment of assignment. If you modify an `NSMutableAttributedString` that has already been given to a view, what the view displays doesn't change; assign it again.

`NSMutableAttributedString` does not fire events. Its content is modified only by the app's own code, so there is no change notification.

**Inheritance**: `EventTarget` → `NSObject` → [`NSAttributedString`](ns-attributed-string.md) → `NSMutableAttributedString`

For how to build an attributed string piece by piece, see the guide [Displaying styled text](../guides/attributed-text.md).

## Constructor

[`NSMutableAttributedString()`](ns-mutable-attributed-string/constructor.md)

Creates a mutable attributed string. The arguments are the same as for [`NSAttributedString()`](ns-attributed-string/constructor.md).

## Instance properties

`NSMutableAttributedString` has no properties of its own. It also inherits `string` and `length` from [`NSAttributedString`](ns-attributed-string.md); after the content changes, they read the new values.

## Instance methods

It also inherits the methods of [`NSAttributedString`](ns-attributed-string.md): reading attributes, taking a substring, comparing, measuring size, and copying.

Changing attributes:

| Method | Description |
| --- | --- |
| [`addAttribute()`](ns-mutable-attributed-string/addattribute.md) | Adds one attribute to a range. An attribute with the same name is overwritten; other attributes are untouched |
| [`addAttributes()`](ns-mutable-attributed-string/addattributes.md) | Adds a set of attributes to a range. Attributes with the same names are overwritten; other attributes are untouched |
| [`setAttributes()`](ns-mutable-attributed-string/setattributes.md) | Replaces all the attributes of a range with this set |
| [`removeAttribute()`](ns-mutable-attributed-string/removeattribute.md) | Removes one attribute from a range |

Changing text:

| Method | Description |
| --- | --- |
| [`appendAttributedString()`](ns-mutable-attributed-string/appendattributedstring.md) | Appends another attributed string to the end |
| [`insertAttributedString()`](ns-mutable-attributed-string/insertattributedstring.md) | Inserts before a given position |
| [`replaceCharactersInRange()`](ns-mutable-attributed-string/replacecharactersinrange.md) | Replaces a range of text with a string or another attributed string |
| [`deleteCharactersInRange()`](ns-mutable-attributed-string/deletecharactersinrange.md) | Deletes a range of text |
| [`setAttributedString()`](ns-mutable-attributed-string/setattributedstring.md) | Replaces the entire content with the content of another attributed string |

## Examples

### Coloring part of the text

```js
const source = 'Total ¥128.00';
const text = new NSMutableAttributedString(source, { font: UIFont.systemFontOfSize(17) });
const start = source.indexOf('¥');
text.addAttribute('foregroundColor', {
  value: 'systemRed',
  range: new NSRange(start, source.length - start),
});
const label = new UILabel();
label.attributedText = text;
```

**Effect** (not verified in the simulator): "Total" is in the default color, and "¥128.00" is red.

### Changing the text

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.replaceCharactersInRange(new NSRange(1, 1), { withString: 'XYZ' });
text.insertAttributedString(new NSAttributedString('>'), { atIndex: 0 });
text.deleteCharactersInRange(new NSRange(0, 1));
console.log(text.string);
```

**Result**: The console logs `aXYZc`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[NSMutableAttributedString alloc] initWithAttributedString:other]` | `new NSMutableAttributedString(other)` |
| `[text addAttribute:NSKernAttributeName value:@2 range:NSMakeRange(0, 3)]` | `text.addAttribute('kern', { value: 2, range: new NSRange(0, 3) })` |
| `[text setAttributes:attrs range:range]` | `text.setAttributes(attrs, { range })` |
| `[text removeAttribute:NSKernAttributeName range:range]` | `text.removeAttribute('kern', { range })` |
| `[text appendAttributedString:other]` | `text.appendAttributedString(other)` |
| `[text insertAttributedString:other atIndex:0]` | `text.insertAttributedString(other, { atIndex: 0 })` |
| `[text replaceCharactersInRange:range withString:@"x"]` | `text.replaceCharactersInRange(range, { withString: 'x' })` |

## See also

- [`NSAttributedString`](ns-attributed-string.md): reading attributes, measuring size, and the full list of attribute names
- [Displaying styled text](../guides/attributed-text.md)
