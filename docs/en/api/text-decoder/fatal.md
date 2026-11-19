---
type: reference
web: TextDecoder.fatal
---

# `TextDecoder`: `fatal` property

The **`fatal`** property indicates whether invalid bytes throw.

## Value

A boolean: the `fatal` given at creation; defaults to `false`.

- `true`: [`decode()`](decode.md) throws `TypeError` on invalid bytes.
- `false`: invalid bytes are replaced with `�`.

- Read-only. Assigning to it throws `TypeError`.
- It never changes after creation, so there is no change notification.

## Examples

```js
console.log(new TextDecoder().fatal, new TextDecoder('utf-8', { fatal: true }).fatal);
```

**Result**: logs `false true`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`TextDecoder()`](constructor.md)
