---
type: reference
native: NSParagraphStyle.defaultParagraphStyle
---

# `NSParagraphStyle.defaultParagraphStyle` static property

The **`NSParagraphStyle.defaultParagraphStyle`** static property is the system's default paragraph style.

## Value

An `NSParagraphStyle` whose properties are all read-only and all at their defaults: `alignment` is `'natural'`, `lineBreakMode` is `'byWordWrapping'`, and lengths and multipliers are `0`.

- Read-only; assigning to it throws `TypeError`.
- To build on the default style, call [`mutableCopy()`](mutablecopy.md).

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle.mutableCopy();
style.lineSpacing = 6;
console.log(style.lineSpacing, NSParagraphStyle.defaultParagraphStyle.lineSpacing);
```

**Result**: the console prints `6 0`. The default style is unchanged.

## Corresponding iOS API

`NSParagraphStyle.defaultParagraphStyle`.

## See also

- [`NSParagraphStyle()`](constructor.md)
