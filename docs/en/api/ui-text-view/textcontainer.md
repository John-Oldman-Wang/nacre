---
type: reference
native: UITextView.textContainer
---

# `UITextView`: `textContainer` property

The **`textContainer`** property is the area where text is laid out, an [`NSTextContainer`](../ns-text-container.md).

## Value

An [`NSTextContainer`](../ns-text-container.md).

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object. Changing its properties changes the layout in the text view.

## Examples

```js
const input = new UITextView();
const container = input.textContainer;
console.log(container === input.textContainer, container.lineFragmentPadding);
```

**Result**: logs `true 5`.

## Corresponding iOS API

`UITextView.textContainer`.

## See also

- [`NSTextContainer`](../ns-text-container.md)
