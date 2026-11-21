---
type: reference
native: "UITextViewDelegate textView:primaryActionForTextItem:defaultAction:"
---

# `UITextView`: `linkclick` event

The **`linkclick`** event fires when the user taps a link in the text view's attributed text. Calling `preventDefault()` in a listener keeps the system from opening the link, so the app can handle it itself, for example by opening a page inside the app.

A link in attributed text is a stretch of text with the `link` attribute; see [Attributed strings](../ns-attributed-string.md).

## Syntax

```
input.addEventListener('linkclick', (event) => { })
```

## Event object

`UITextViewLinkClickEvent`. `type` is `'linkclick'` and `target` is this text view. Cancelable (measured).

It also carries two read-only fields (measured):

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | String | The link's address |
| `range` | [`NSRange`](../ns-range.md) | The stretch of text the link covers. `location` is the start and `length` is the length, both in UTF-16 code units, matching JS string indices |

## When it fires

- Fires when the user taps a link in the attributed text. According to Apple's documentation, links can be tapped only when [`isEditable`](iseditable.md) is `false` and [`isSelectable`](isselectable.md) is `true`. Real taps are **not verified on a device**.
- If `preventDefault()` is called: the system does not open the link.
- If not, or if there are no listeners: the system opens the link the default way, handing web addresses to the browser and other schemes to the corresponding app.
- The fields listeners receive when the system asks, and the result handed back to the system depending on whether `preventDefault()` was called, are verified by the acceptance tests by asking the way the system does.
- Fires only for links. Tapping an attachment in the attributed text (such as an image inserted into the text) doesn't fire it and is handled the system's default way.
- Whether it fires when phone numbers or web addresses recognized by [`dataDetectorTypes`](datadetectortypes.md) are tapped is **not verified on a device**.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event, and tapping a link opens it the default way (measured).
- Exists only on `UITextView`. Listening for it on other views does not throw; it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()` (measured).

> **Note:** The system waits while listeners run. In a listener, only make the decision; do things such as opening a page after deciding.

## Examples

```js
const terms = new UITextView();
terms.isEditable = false;
terms.attributedText = new NSAttributedString('Read the Terms of Service', { link: 'https://example.com/terms' });
terms.addEventListener('linkclick', (event) => {
  if (event.url.startsWith('https://example.com/')) {
    event.preventDefault();
    console.log('Opening in the app: ' + event.url);
  }
});
```

**Effect**: Tapping this text doesn't switch to the browser, and the console prints `Opening in the app: https://example.com/terms`. Links to other sites are handed to the browser as usual. **Not verified on a device.**

## Corresponding iOS API

`textView:primaryActionForTextItem:defaultAction:` in `UITextViewDelegate`; it fires when `textItem`'s `contentType` is `UITextItemContentTypeLink`. Calling `event.preventDefault()` here corresponds to returning `nil`; not calling it corresponds to returning `defaultAction`. `textItem.link` is in `event.url`, and `textItem.range` is in `event.range`.

## See also

- [Attributed strings](../ns-attributed-string.md): how to add a link to a stretch of text
- [`isEditable`](iseditable.md)
- [`NSRange`](../ns-range.md)
