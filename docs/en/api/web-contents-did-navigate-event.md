---
type: reference
native: WebContentsDidNavigateEvent
---

# `WebContentsDidNavigateEvent`

**`WebContentsDidNavigateEvent`** represents the web page moving to a new URL.

The [`did-navigate`](web-contents/did-navigate-event.md) event of [`WebContents`](web-contents.md) is this class. It carries the new URL and the HTTP status code.

**Inheritance**: [`Event`](event.md) → `WebContentsDidNavigateEvent`

## Constructor

[`WebContentsDidNavigateEvent()`](web-contents-did-navigate-event/constructor.md)

Creates a `WebContentsDidNavigateEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`url`](web-contents-did-navigate-event/url.md) <small>read-only</small> | The new URL |
| [`httpResponseCode`](web-contents-did-navigate-event/httpresponsecode.md) <small>read-only</small> | The HTTP status code |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebContents`](web-contents.md) | [`did-navigate`](web-contents/did-navigate-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', (e) => {
  console.log(e instanceof WebContentsDidNavigateEvent, e.httpResponseCode, e.url);
});
contents.loadURL('https://example.com');
```

**Effect**: once the page loads, prints `true 200 https://example.com/`. **Not verified in the simulator.**

## Corresponding iOS API

There is no corresponding system API. The event name and field names follow the event of the same name on Electron's `webContents`. The native equivalent is `webView:didCommitNavigation:`.

## See also

- [`did-navigate`](web-contents/did-navigate-event.md): when it is fired
- [`WebContents`](web-contents.md)
