---
type: reference
native: WebContentsDidFailLoadEvent
---

# `WebContentsDidFailLoadEvent`

**`WebContentsDidFailLoadEvent`** represents a web page that failed to load.

The [`did-fail-load`](web-contents/did-fail-load-event.md) event of [`WebContents`](web-contents.md) is this class. It carries the system error code, its description, and the URL that failed. A 404 or 500 from the server doesn't count as a failure.

**Inheritance**: [`Event`](event.md) → `WebContentsDidFailLoadEvent`

## Constructor

[`WebContentsDidFailLoadEvent()`](web-contents-did-fail-load-event/constructor.md)

Creates a `WebContentsDidFailLoadEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`errorCode`](web-contents-did-fail-load-event/errorcode.md) <small>read-only</small> | The system error code |
| [`errorDescription`](web-contents-did-fail-load-event/errordescription.md) <small>read-only</small> | A text description of the error |
| [`validatedURL`](web-contents-did-fail-load-event/validatedurl.md) <small>read-only</small> | The URL that failed to load |
| [`isMainFrame`](web-contents-did-fail-load-event/ismainframe.md) <small>read-only</small> | Always `true` |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebContents`](web-contents.md) | [`did-fail-load`](web-contents/did-fail-load-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log(e instanceof WebContentsDidFailLoadEvent, e.errorCode, e.validatedURL);
});
contents.loadURL('https://no-such-host.invalid').catch(() => {});
```

**Effect**: the load fails and prints `true`, the error code (such as `-1003`), and the URL that failed.

## Corresponding iOS API

There is no corresponding system API. The event name and field names follow the event of the same name on Electron's `webContents`. The error codes are the system's, not Chromium's. The native equivalents are `webView:didFailNavigation:withError:` and `webView:didFailProvisionalNavigation:withError:`.

## See also

- [`did-fail-load`](web-contents/did-fail-load-event.md): when it is fired
- [`WebContents`](web-contents.md)
