---
type: reference
web: Blob.size
---

# `Blob`: `size` property

The **`size`** property is the number of bytes in the `Blob`'s contents.

## Value

A number, in bytes.

- Read-only. Assigning to it throws `TypeError`.
- A `Blob`'s contents are immutable, so `size` never changes.
- Strings are counted after UTF-8 encoding; each Chinese character takes 3 bytes.

## Examples

```js
const blob = new Blob(['前缀-', '后缀']);
console.log(blob.size);
```

**Result**: prints `13`.

## Differences from the web

Same as the web.

## See also

- [`type`](type.md)
