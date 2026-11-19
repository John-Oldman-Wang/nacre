---
type: reference
native: ErrorEvent.error
---

# `ErrorEvent`: `error` property

The **`error`** property is the value that was thrown.

## Value

Of type `unknown`. Usually an `Error` object, but JS allows any value to be thrown, so check it before use.

- Read-only. Assigning to it throws `TypeError`.
- It is the very object passed to `throw` (verified by testing).

## Examples

```js
application.addEventListener('error', (e) => {
  if (e.error instanceof Error) {
    console.log(e.error.message);
  } else {
    console.log('Thrown value is not an Error:', String(e.error));
  }
  e.preventDefault();
});
throw new Error('Broken');
```

**Result**: prints `Broken`.

## See also

- [`message`](message.md)
