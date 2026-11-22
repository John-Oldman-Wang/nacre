---
type: reference
native: WebContentsPageTitleUpdatedEvent
---

# `WebContentsPageTitleUpdatedEvent`

**`WebContentsPageTitleUpdatedEvent`** represents a change of the web page's title.

The [`page-title-updated`](web-contents/page-title-updated-event.md) event of [`WebContents`](web-contents.md) is this class, and [`title`](web-contents-page-title-updated-event/title.md) is the new title.

**Inheritance**: [`Event`](event.md) → `WebContentsPageTitleUpdatedEvent`

## Constructor

[`WebContentsPageTitleUpdatedEvent()`](web-contents-page-title-updated-event/constructor.md)

Creates a `WebContentsPageTitleUpdatedEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`title`](web-contents-page-title-updated-event/title.md) <small>read-only</small> | The new title |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebContents`](web-contents.md) | [`page-title-updated`](web-contents/page-title-updated-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('page-title-updated', (e) => {
  console.log(e instanceof WebContentsPageTitleUpdatedEvent, e.title);
});
contents.loadURL('https://example.com');
```

**Effect**: once the title arrives, prints `true` and the page title.

## Corresponding iOS API

There is no corresponding system API. The event name and field names follow the event of the same name on Electron's `webContents`. The native equivalent is key-value observing of `title` on `WKWebView`.

## See also

- [`page-title-updated`](web-contents/page-title-updated-event.md): when it is fired
- [`WebContents`](web-contents.md)
