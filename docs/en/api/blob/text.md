---
type: reference
web: Blob.text()
---

# `Blob`: `text()` method

The **`text()`** method decodes the `Blob`'s contents as UTF-8 into a string.

## Syntax

```
text()
```

### Parameters

None.

### Return value

A `Promise` that resolves with a string. Can be called any number of times. Decoding happens in the background, so decoding large text doesn't freeze the UI.

What you get when the contents aren't valid UTF-8 is **not verified in the simulator**.

### Exceptions

None.

## Examples

```js
async function main() {
  const blob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
  console.log(await blob.text());
}
main();
```

**Result**: prints `前缀-后缀`.

## Differences from the web

Same as the web.

## See also

- [`arrayBuffer()`](arraybuffer.md)
