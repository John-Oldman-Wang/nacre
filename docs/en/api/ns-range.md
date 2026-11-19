---
type: reference
native: NSRange
---

# `NSRange`

**`NSRange`** represents a range of text: [`length`](ns-range/length.md) UTF-16 code units starting at [`location`](ns-range/location.md).

The unit is the same as JS string indices. So `text.slice(location, location + length)` extracts exactly that range, and `text.length` is the largest `location`. Most characters take one code unit; emoji and some CJK characters take two. A `length` of 0 is a position with no content; in a text field it is the cursor.

It is used by: the `selectedRange` of [`UITextField`](ui-text-field.md) and [`UITextView`](ui-text-view.md), `UITextView.scrollRangeToVisible()`, the `beforeinput` event of `UITextField`, and every method that takes a range on [attributed strings](ns-attributed-string.md).

`NSRange` is a [struct](structs.md): a value, not a reference to an object. The rules are the same as for `CGRect` and its group:

- **Fields are read-only.** To change one, replace the whole value with a new one.
- **Plain objects are accepted when writing.** Where an `NSRange` is expected, `{ location: 3, length: 0 }` is equivalent to `new NSRange(3, 0)`. What you read back is always an `NSRange`.
- **Every read returns a new object.** `input.selectedRange === input.selectedRange` is `false`. Compare ranges by their fields.
- **As a string** it is `NSRange(3, 0)`; through `JSON.stringify` it is `{"location":3,"length":0}`.

**Inheritance**: `NSRange`. It does not inherit from `NSObject`.

## Constructor

[`NSRange()`](ns-range/constructor.md)

Creates a range from a start and a length.

## Instance properties

| Property | Description |
| --- | --- |
| [`location`](ns-range/location.md) <small>read-only</small> | Where the range starts |
| [`length`](ns-range/length.md) <small>read-only</small> | How long the range is |

## Examples

### Selecting an emoji

```js
const input = new UITextView();
input.text = 'a😀b';
console.log(input.text.length);
input.selectedRange = new NSRange(1, 2);
console.log(String(input.selectedRange));
```

**Result**: logs `4` and `NSRange(1, 2)`. `(1, 2)` selects exactly the emoji (verified by testing).

> **Note:** Placing the cursor between the two code units of an emoji (`new NSRange(2, 0)` in the example above) is not corrected. Inserting text there splits the emoji in two (verified by testing). Avoid such positions when computing them yourself.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `NSMakeRange(0, 5)` | `new NSRange(0, 5)` |
| `range.location` | `range.location` |
| `range.length` | `range.length` |
| `NSMaxRange(range)` | `range.location + range.length` |
| `NSStringFromRange(range)` | `String(range)`, which gives `NSRange(0, 5)` |

## See also

- [Structs](structs.md): rules shared by all structs
- [`selectedRange` of `UITextView`](ui-text-view/selectedrange.md), [`selectedRange` of `UITextField`](ui-text-field/selectedrange.md)
- [Attributed strings](ns-attributed-string.md)
