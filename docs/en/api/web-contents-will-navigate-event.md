---
type: reference
native: WebContentsWillNavigateEvent
---

# `WebContentsWillNavigateEvent`

**`WebContentsWillNavigateEvent`** represents a navigation the web page started itself, before the navigation begins.

The [`will-navigate`](web-contents/will-navigate-event.md) event of [`WebContents`](web-contents.md) is this class. When a listener calls `preventDefault()`, the page stays where it is.

**Inheritance**: [`Event`](event.md) → `WebContentsWillNavigateEvent`

## Constructor

[`WebContentsWillNavigateEvent()`](web-contents-will-navigate-event/constructor.md)

Creates a `WebContentsWillNavigateEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`url`](web-contents-will-navigate-event/url.md) <small>read-only</small> | The URL to go to |
| [`isMainFrame`](web-contents-will-navigate-event/ismainframe.md) <small>read-only</small> | Always `true` |
| [`navigationType`](web-contents-will-navigate-event/navigationtype.md) <small>read-only</small> | What caused this navigation |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebContents`](web-contents.md) | [`will-navigate`](web-contents/will-navigate-event.md) |

It can be canceled: `cancelable` is `true`. Whether to let it through is decided the moment the listener returns; calling `preventDefault()` after an `await` has no effect.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  console.log(e instanceof WebContentsWillNavigateEvent, e.navigationType, e.url);
  if (e.url.startsWith('tel:')) {
    e.preventDefault();
  }
});
```

**Effect**: each time the page starts a navigation, prints `true`, the cause, and the URL. `tel:` links are blocked.

## Corresponding iOS API

There is no corresponding system API. The event name and field names follow the event of the same name on Electron's `webContents`. The native equivalent is `webView:decidePolicyForNavigationAction:decisionHandler:`; `decisionHandler(.cancel)` corresponds to `e.preventDefault()`.

## See also

- [`will-navigate`](web-contents/will-navigate-event.md): when it is fired
- [`WebContents`](web-contents.md)
