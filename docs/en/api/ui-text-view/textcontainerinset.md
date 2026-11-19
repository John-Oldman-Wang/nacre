---
type: reference
native: UITextView.textContainerInset
---

# `UITextView`: `textContainerInset` property

The **`textContainerInset`** property determines how far the text is from the four edges of the text view.

## Value

A [`UIEdgeInsets`](../structs.md) with four fields, `top`, `left`, `bottom`, and `right`, in [points (pt)](../units.md).

- Readable and writable.
- The default value is 8 at the top and bottom and 0 at the left and right.
- When writing, you can pass a plain object `{ top, left, bottom, right }`. Reading returns a `UIEdgeInsets` whose fields are read-only.
- The distance from the text to the left and right edges is the left and right values here plus [`textContainer.lineFragmentPadding`](../ns-text-container/linefragmentpadding.md) (5 by default). So in a new text view, the text is 5 pt from the left edge and 8 pt from the top edge.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12);
input.textContainer.lineFragmentPadding = 0;
```

**Effect**: the text is 12 pt from each of the four edges.

## Corresponding iOS API

`UITextView.textContainerInset`. `UIEdgeInsetsMake(12, 12, 12, 12)` is written `new UIEdgeInsets(12, 12, 12, 12)`.

## See also

- [`NSTextContainer`](../ns-text-container.md)
- [Structs](../structs.md)
