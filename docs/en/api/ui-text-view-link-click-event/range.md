---
type: reference
native: UITextViewLinkClickEvent.range
---

# `UITextViewLinkClickEvent`: `range` property

The **`range`** property is the range the link covers in the text.

## Value

An [`NSRange`](../ns-range.md). `location` is the start and `length` the length, both in UTF-16 code units, matching JS string indexes.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const terms = new UITextView();
terms.isEditable = false;
terms.attributedText = new NSAttributedString('阅读《用户协议》', { link: 'https://example.com/terms' });
terms.addEventListener('linkclick', (e) => {
  console.log(terms.text.slice(e.range.location, e.range.location + e.range.length));
});
```

**Effect**: tapping the link prints the linked text `阅读《用户协议》`.

## Corresponding iOS API

`textItem.range` in `textView:primaryActionForTextItem:defaultAction:`.

## See also

- [`UITextViewLinkClickEvent`](../ui-text-view-link-click-event.md)
