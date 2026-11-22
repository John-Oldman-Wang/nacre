---
type: reference
web: DOMException.name
---

# `DOMException`: `name` property

The **`name`** property is the error's category name, such as `'AbortError'` or `'NotFoundError'`. Check it to tell what went wrong.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value doesn't change.
- It's the name given at construction; `'Error'` if none was given.
- For errors the runtime gives, `name` is a name from the web standards; see [Names the runtime gives](../dom-exception.md#names-the-runtime-gives) for all values.

## Examples

```js
const controller = new AbortController();
fetch('https://example.com/', { signal: controller.signal }).catch((err) => {
  if (err instanceof DOMException && err.name === 'AbortError') {
    console.log('The request was canceled');
  }
});
controller.abort();
```

**Result**: Prints `The request was canceled`.

## See also

- [`code`](code.md): the legacy numeric code for the name
- [`DOMException()`](constructor.md)
