---
type: reference
native: "-[NSMutableParagraphStyle init]"
---

# `NSMutableParagraphStyle()` constructor

The **`NSMutableParagraphStyle()`** constructor creates a mutable paragraph style.

## Syntax

```
new NSMutableParagraphStyle()
```

### Parameters

None.

### Return value

A new `NSMutableParagraphStyle` with all properties at their defaults, the same as [`NSParagraphStyle.defaultParagraphStyle`](../ns-paragraph-style/defaultparagraphstyle.md).

### Exceptions

It can't be subclassed: `class X extends NSMutableParagraphStyle {}` throws `TypeError` at `new X()`; see [Native classes](../native-classes.md).

## Examples

```js
const style = new NSMutableParagraphStyle();
style.firstLineHeadIndent = 32;
const text = new NSAttributedString('A paragraph whose first line is indented by two characters.', {
  font: UIFont.systemFontOfSize(16),
  paragraphStyle: style,
});
```

**Effect**: The first line of this paragraph is indented 32 pt from the left. **Not verified in the simulator.**

## Corresponding iOS API

`[[NSMutableParagraphStyle alloc] init]`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
