---
type: reference
web: TextDecoder.encoding
---

# `TextDecoder`: `encoding` property

The **`encoding`** property is the encoding the decoder uses.

## Value

A string, always `'utf-8'`, regardless of which spelling was used at creation.

- Read-only. Assigning to it throws `TypeError`.
- It never changes after creation, so there is no change notification.

## Examples

```js
console.log(new TextDecoder('UTF8').encoding);
```

**Result**: logs `utf-8`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`TextDecoder()`](constructor.md)
