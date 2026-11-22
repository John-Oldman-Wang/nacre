---
type: reference
native: UITextViewLinkClickEvent
---

# `UITextViewLinkClickEvent`

**`UITextViewLinkClickEvent`** represents the user tapping a link in multiline text, before the system opens it.

The [`linkclick`](ui-text-view/linkclick-event.md) event of [`UITextView`](ui-text-view.md) is this class. It carries the link URL and its range in the text. When a listener calls `preventDefault()`, the system doesn't open the link, and the app handles it itself.

**Inheritance**: [`Event`](event.md) → `UITextViewLinkClickEvent`

## Constructor

[`UITextViewLinkClickEvent()`](ui-text-view-link-click-event/constructor.md)

Creates a `UITextViewLinkClickEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`url`](ui-text-view-link-click-event/url.md) <small>read-only</small> | The link URL |
| [`range`](ui-text-view-link-click-event/range.md) <small>read-only</small> | The range of the link in the text |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UITextView`](ui-text-view.md) | [`linkclick`](ui-text-view/linkclick-event.md) |

It can be canceled: `cancelable` is `true`, and calling `preventDefault()` keeps the system from opening the link.

## Examples

```js
const terms = new UITextView();
terms.isEditable = false;
terms.attributedText = new NSAttributedString('阅读《用户协议》', { link: 'https://example.com/terms' });
terms.addEventListener('linkclick', (e) => {
  console.log(e instanceof UITextViewLinkClickEvent, e.url);
  e.preventDefault();
});
```

**Effect**: tapping `《用户协议》` prints `true https://example.com/terms`, and the system doesn't open the URL.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `textView:primaryActionForTextItem:defaultAction:` | The `linkclick` event |
| `textItem.link` | `event.url` |
| `textItem.range` | `event.range` |
| Returning `nil` | Calling `event.preventDefault()` |

## See also

- [`linkclick`](ui-text-view/linkclick-event.md): when it is fired
- [`UITextView`](ui-text-view.md)
