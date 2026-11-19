---
type: reference
native: Event.type
---

# `Event`: `type` property

The **`type`** property is the event name.

## Value

A string. Names of events fired by the system are all lowercase.

- Read-only. Assigning to it throws `TypeError`.
- The value is the event name given at construction.

## Examples

```js
console.log(new Event('login').type);
```

**Result**: The console prints `login`.

## See also

- [`Event()`](constructor.md)
