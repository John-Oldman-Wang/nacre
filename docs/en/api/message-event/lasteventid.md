---
type: reference
web: MessageEvent.lastEventId
---

# `MessageEvent`: `lastEventId` property

The **`lastEventId`** property is the ID of the message.

## Value

A string. Messages the runtime fires have no ID; it is an empty string.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const event = new MessageEvent('message', { data: 'hi', lastEventId: '7' });
console.log(event.lastEventId);
```

**Effect**: the console prints `7`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `MessageEvent.lastEventId` in the browser.

## See also

- [`MessageEvent`](../message-event.md)
