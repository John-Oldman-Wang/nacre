---
type: reference
web: TextDecoder.ignoreBOM
---

# `TextDecoder`: `ignoreBOM` property

The **`ignoreBOM`** property indicates whether a leading [BOM](../text-decoder.md#bom) is kept.

## Value

A boolean: the `ignoreBOM` given at creation; defaults to `false`.

- `true`: a leading BOM is kept, and the decoded string starts with U+FEFF.
- `false`: one leading BOM is removed.

- Read-only. Assigning to it throws `TypeError`.
- It never changes after creation, so there is no change notification.

## Examples

```js
console.log(new TextDecoder('utf-8', { ignoreBOM: true }).ignoreBOM);
```

**Result**: logs `true`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`TextDecoder()`](constructor.md)
