---
type: reference
web: ReadableStream[Symbol.asyncIterator]()
---

# `ReadableStream`: `[Symbol.asyncIterator]()` method

The **`[Symbol.asyncIterator]()`** method is the same function as [`values()`](values.md). It lets a stream go straight into `for await (const chunk of stream)`.

## Syntax

```
stream[Symbol.asyncIterator]()
stream[Symbol.asyncIterator]({ preventCancel })
```

### Parameters

**`options.preventCancel`**

Same as for [`values()`](values.md). Writing `for await (const chunk of stream)` directly doesn't pass it, so exiting the loop early cancels the stream.

### Return value

An async iterator, the same as from `values()`.

### Exceptions

**`TypeError`**

The stream is locked: `This ReadableStream is locked: it already has a reader, or its body has been read`.

## Examples

```js
const res = new Response('abc');
if (res.body !== null) {
  console.log(res.body[Symbol.asyncIterator] === res.body.values);
}
```

**Result**: logs `true`.

## Differences from the web

Same as the web.

## See also

- [`values()`](values.md)
