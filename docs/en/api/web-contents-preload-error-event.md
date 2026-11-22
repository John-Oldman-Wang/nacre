---
type: reference
native: WebContentsPreloadErrorEvent
---

# `WebContentsPreloadErrorEvent`

**`WebContentsPreloadErrorEvent`** represents an exception thrown while the preload script was running.

The [`preload-error`](web-contents/preload-error-event.md) event of [`WebContents`](web-contents.md) is this class. It carries the script path and the error that was thrown. For preload scripts, see [`WebView`](web-view.md#preload-scripts).

**Inheritance**: [`Event`](event.md) → `WebContentsPreloadErrorEvent`

## Constructor

[`WebContentsPreloadErrorEvent()`](web-contents-preload-error-event/constructor.md)

Creates a `WebContentsPreloadErrorEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`preloadPath`](web-contents-preload-error-event/preloadpath.md) <small>read-only</small> | The path of the preload script |
| [`error`](web-contents-preload-error-event/error.md) <small>read-only</small> | The error that was thrown |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebContents`](web-contents.md) | [`preload-error`](web-contents/preload-error-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('preload-error', (e) => {
  console.log(e instanceof WebContentsPreloadErrorEvent, e.preloadPath, e.error.message);
});
```

**Effect**: when the preload script throws, prints `true`, the script path, and the error text.

## Corresponding iOS API

There is no corresponding system API. The event name and field names follow the event of the same name on Electron's `webContents`.

## See also

- [`preload-error`](web-contents/preload-error-event.md): when it is fired
- [`WebView`](web-view.md)
