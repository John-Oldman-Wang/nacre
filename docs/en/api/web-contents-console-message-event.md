---
type: reference
native: WebContentsConsoleMessageEvent
---

# `WebContentsConsoleMessageEvent`

**`WebContentsConsoleMessageEvent`** represents a log message the web page wrote to `console`.

The [`console-message`](web-contents/console-message-event.md) event of [`WebContents`](web-contents.md) is this class. It carries the log level, text, and location. Uncaught exceptions in the page are reported here too.

**Inheritance**: [`Event`](event.md) → `WebContentsConsoleMessageEvent`

## Constructor

[`WebContentsConsoleMessageEvent()`](web-contents-console-message-event/constructor.md)

Creates a `WebContentsConsoleMessageEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`level`](web-contents-console-message-event/level.md) <small>read-only</small> | The log level |
| [`message`](web-contents-console-message-event/message.md) <small>read-only</small> | The log text |
| [`lineNumber`](web-contents-console-message-event/linenumber.md) <small>read-only</small> | The line where it was called |
| [`sourceId`](web-contents-console-message-event/sourceid.md) <small>read-only</small> | The file where it was called |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebContents`](web-contents.md) | [`console-message`](web-contents/console-message-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  console.log(e instanceof WebContentsConsoleMessageEvent, '[网页 ' + e.level + '] ' + e.message);
});
contents.loadURL('data:text/html;charset=utf-8,' +
  encodeURIComponent('<script>console.warn("w");</script>'));
```

**Effect**: prints `true [网页 warning] w`.

## Corresponding iOS API

There is no corresponding system API. The event name and field names follow the event of the same name on Electron's `webContents`.

## See also

- [`console-message`](web-contents/console-message-event.md): when it is fired and how the text is built
- [`WebContents`](web-contents.md)
