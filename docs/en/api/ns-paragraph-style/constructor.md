---
type: reference
native: "-[NSParagraphStyle init]"
---

# `NSParagraphStyle()` constructor

The **`NSParagraphStyle()`** constructor creates a default paragraph style. All its properties are read-only.

## Syntax

```
new NSParagraphStyle()
```

### Parameters

None.

### Return value

A new `NSParagraphStyle` whose values are the same as [`NSParagraphStyle.defaultParagraphStyle`](defaultparagraphstyle.md).

To set values, use [`new NSMutableParagraphStyle()`](../ns-mutable-paragraph-style/constructor.md).

### Exceptions

It can't be subclassed: `class X extends NSParagraphStyle {}` throws `TypeError` at `new X()`. See [Native classes](../native-classes.md).

## Examples

```js
const style = new NSParagraphStyle();
console.log(style.alignment, style.lineSpacing);
```

**Result**: the console prints `natural 0`.

## Corresponding iOS API

`[[NSParagraphStyle alloc] init]`.

## See also

- [`NSMutableParagraphStyle()`](../ns-mutable-paragraph-style/constructor.md)
