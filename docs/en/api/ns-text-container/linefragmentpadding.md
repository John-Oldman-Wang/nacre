---
type: reference
native: NSTextContainer.lineFragmentPadding
---

# `NSTextContainer`: `lineFragmentPadding` property

The **`lineFragmentPadding`** property is how much space each line of text leaves on the left and on the right.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `5`.
- It's added on top of the left and right of the `UITextView`'s [`textContainerInset`](../ui-text-view/textcontainerinset.md). To left-align with other views, set it to `0`, so the left and right distances are determined only by `textContainerInset`.
- No change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12);
input.textContainer.lineFragmentPadding = 0;
```

**Effect**: the text is 12 pt from each of the four edges.

## Corresponding iOS API

`NSTextContainer.lineFragmentPadding`.

## See also

- [`textContainerInset`](../ui-text-view/textcontainerinset.md)
