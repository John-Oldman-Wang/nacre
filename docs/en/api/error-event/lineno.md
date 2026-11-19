---
type: reference
native: ErrorEvent.lineno
---

# `ErrorEvent`: `lineno` property

The **`lineno`** property is the line number where the error occurred.

## Value

A number.

- Read-only. Assigning to it throws `TypeError`.
- It is the line number in the bundled `main.js`, not in the source files before bundling.

## Examples

```js
application.addEventListener('error', (e) => {
  console.log(typeof e.lineno);
  e.preventDefault();
});
throw new Error('Broken');
```

**Result**: prints `number`.

## See also

- [`filename`](filename.md)
