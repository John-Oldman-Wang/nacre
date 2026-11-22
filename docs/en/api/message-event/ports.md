---
type: reference
web: MessageEvent.ports
---

# `MessageEvent`: `ports` property

The **`ports`** property is the ports transferred with the message. Messages the runtime fires carry no ports, so it is always an empty array.

## Value

An array, frozen: nothing can be added to it.

- Read-only. Assigning to it throws `TypeError`.
- When an array is given while building the event, a frozen copy of it is stored.
- When the event is created with [`new`](constructor.md) without it, it is a frozen empty array.

## Examples

```js
const event = new MessageEvent('message');
console.log(event.ports.length, Object.isFrozen(event.ports));
```

**Effect**: the console prints `0 true`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `MessageEvent.ports` in the browser.

## See also

- [`MessageEvent`](../message-event.md)
