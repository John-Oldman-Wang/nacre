---
type: reference
native: ErrorEvent.filename
---

# `ErrorEvent`: `filename` property

The **`filename`** property is the name of the script that failed.

## Value

A string, for example `'main.js'`.

- Read-only. Assigning to it throws `TypeError`.
- It refers to the bundled `main.js`, not the source files before bundling. To find the failing code, open the bundle output and go to the line given by [`lineno`](lineno.md).

## Examples

```js
application.addEventListener('error', (e) => {
  console.log('Error at', e.filename, e.lineno);
  e.preventDefault();
});
throw new Error('Broken');
```

**Result**: prints `Error at main.js` followed by the line number of the `throw`.

## See also

- [`lineno`](lineno.md)
