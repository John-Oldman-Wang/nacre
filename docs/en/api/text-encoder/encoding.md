---
type: reference
web: TextEncoder.encoding
---

# `TextEncoder`: `encoding` property

The **`encoding`** property is the encoding the encoder uses.

## Value

A string, always `'utf-8'`.

- Read-only; assigning to it throws `TypeError`.
- It never changes, so there are no change notifications.

## Examples

```js
console.log(new TextEncoder().encoding);
```

**Result**: It prints `utf-8`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`TextDecoder.encoding`](../text-decoder/encoding.md)
