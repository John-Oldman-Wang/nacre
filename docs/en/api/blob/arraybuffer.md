---
type: reference
web: Blob.arrayBuffer()
---

# `Blob`: `arrayBuffer()` method

The **`arrayBuffer()`** method reads the contents of the `Blob` into an `ArrayBuffer`.

## Syntax

```
arrayBuffer()
```

### Parameters

None.

### Return value

A `Promise` that resolves with an `ArrayBuffer`.

- Each call gives an independent copy. Modifying it doesn't affect this `Blob` or what later reads return (verified by testing).
- Can be called any number of times.

### Exceptions

None.

## Examples

```js
async function main() {
  const blob = new Blob([new Uint8Array([1, 2, 3])]);
  const a = new Uint8Array(await blob.arrayBuffer());
  a[0] = 99;
  const b = new Uint8Array(await blob.arrayBuffer());
  console.log(b[0]);
}
main();
```

**Result**: prints `1`. Modifying the buffer from the first read doesn't affect the `Blob`.

## Differences from the web

Same as the web.

## See also

- [`text()`](text.md)
