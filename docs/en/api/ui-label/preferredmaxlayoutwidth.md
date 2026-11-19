---
type: reference
native: UILabel.preferredMaxLayoutWidth
---

# `UILabel`: `preferredMaxLayoutWidth` property

The **`preferredMaxLayoutWidth`** property is the wrapping width used to calculate a multi-line label's intrinsic size.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- The default is `0`, meaning not specified.
- When positioning with constraints, the system needs the label's intrinsic size to decide its height. A multi-line label's intrinsic size depends on a width, and this property gives that width.
- When the label's width is already set by constraints (for example, constraints on both left and right), you generally do not need to set it; the system wraps at the width from the constraints. Only a multi-line label whose position is constrained but whose width is not needs it.
- When it is `0` and no other way gives a width, the intrinsic size is calculated as "all the text on one line". **Not verified in the simulator.**

## Examples

```js
const label = new UILabel();
label.text = 'A fairly long piece of text that does not fit on one line; its height is only known after wrapping at a given width.';
label.numberOfLines = 0;
label.preferredMaxLayoutWidth = 320;
console.log(label.intrinsicContentSize.height);
```

**Effect**: The console prints the total height of the text wrapped at a width of 320 pt. **Not verified in the simulator.**

## Corresponding iOS API

`UILabel.preferredMaxLayoutWidth`.

## See also

- [Multi-line text and width](../ui-label.md#multi-line-text-and-width)
- [Intrinsic size](../ui-label.md#intrinsic-size)
