---
type: reference
native: WebContentsIpcMessageEvent
---

# `WebContentsIpcMessageEvent`

**`WebContentsIpcMessageEvent`** represents a message the web page sent through the message channel.

The [`ipc-message`](web-contents/ipc-message-event.md) event of [`WebContents`](web-contents.md) is this class. The page sends it by calling [`ipcRenderer.send()`](ipc-renderer.md), and it carries a channel name and arguments.

**Inheritance**: [`Event`](event.md) → `WebContentsIpcMessageEvent`

## Constructor

[`WebContentsIpcMessageEvent()`](web-contents-ipc-message-event/constructor.md)

Creates a `WebContentsIpcMessageEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`channel`](web-contents-ipc-message-event/channel.md) <small>read-only</small> | The channel name |
| [`args`](web-contents-ipc-message-event/args.md) <small>read-only</small> | The arguments after the channel name |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`WebContents`](web-contents.md) | [`ipc-message`](web-contents/ipc-message-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('ipc-message', (e) => {
  console.log(e instanceof WebContentsIpcMessageEvent, e.channel, e.args.length);
});
```

**Effect**: for each message from the page, prints `true`, the channel name, and the number of arguments.

## Corresponding iOS API

There is no corresponding system API. The event name and field names follow the event of the same name on Electron's `webContents`.

## See also

- [`ipc-message`](web-contents/ipc-message-event.md): when it is fired
- [`ipcRenderer`](ipc-renderer.md): the web page's end
