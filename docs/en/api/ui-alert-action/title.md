---
type: reference
native: UIAlertAction.title
---

# `UIAlertAction`: `title` property

The **`title`** property is the text on the alert button.

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- The value is what was given to [`actionWithTitle()`](actionwithtitle.md) at creation. If `null` or `undefined` was given at creation, it is the empty string.
- To change the title, create a new button.

## Examples

```js
const ok = UIAlertAction.actionWithTitle('Got it', { style: 'default' });
console.log(ok.title);
```

**Result**: The console prints `Got it`.

## Corresponding iOS API

`UIAlertAction.title`.

## See also

- [`style`](style.md)
