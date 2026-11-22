---
type: reference
web: MessageEvent.source
---

# `MessageEvent`: `source` property

The **`source`** property is always `null`.

## Value

`null`.

- Read-only. Assigning to it throws `TypeError`.
- When building an event, `source` can only be given as `null`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const event = new MessageEvent('message');
console.log(event.source);
```

**Effect**: the console prints `null`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `MessageEvent.source` in the browser.

## See also

- [`MessageEvent`](../message-event.md)
