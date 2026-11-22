---
type: reference
native: UITextViewLinkClickEvent.url
---

# `UITextViewLinkClickEvent`: `url` property

The **`url`** property is the link URL.

## Value

A string: the URL written in the `link` attribute of the attributed text.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const terms = new UITextView();
terms.isEditable = false;
terms.attributedText = new NSAttributedString('阅读《用户协议》', { link: 'https://example.com/terms' });
terms.addEventListener('linkclick', (e) => {
  console.log(e.url);
});
```

**Effect**: tapping `《用户协议》` prints `https://example.com/terms`, then the system opens that URL. A real tap is **not verified on a device**.

## Corresponding iOS API

`textItem.link` in `textView:primaryActionForTextItem:defaultAction:`.

## See also

- [`UITextViewLinkClickEvent`](../ui-text-view-link-click-event.md)
