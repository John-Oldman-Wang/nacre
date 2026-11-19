---
type: reference
native: "-[UIView sizeToFit]"
---

# `UIView`: `sizeToFit()` method

The **`sizeToFit()`** method resizes the view to just fit its content, keeping its position.

## Syntax

```
sizeToFit()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const label = new UILabel();
label.text = 'Hello, Nacre';
label.frame = new CGRect(40, 500, 0, 0);
label.sizeToFit();
```

**Effect**: The top-left corner of `label` stays at `(40, 500)`, and its width and height become the size of the text.

## Corresponding iOS API

`-[UIView sizeToFit]`.

## See also

- [`sizeThatFits()`](sizethatfits.md)
