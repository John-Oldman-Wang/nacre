---
type: reference
native: UIPasteboard.generalPasteboard
---

# `UIPasteboard.generalPasteboard` static property

The **`UIPasteboard.generalPasteboard`** static property is the clipboard shared by the whole system.

## Value

A `UIPasteboard`.

- Read-only.
- Every read gives the same object.
- `UIPasteboard` cannot be created with `new`; this is the only way to get an instance. `new UIPasteboard()` throws `TypeError: Illegal constructor: UIPasteboard is created by the runtime, not by new`.

## Examples

```js
const pasteboard = UIPasteboard.generalPasteboard;
console.log(pasteboard === UIPasteboard.generalPasteboard);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UIPasteboard.generalPasteboard`.

## See also

- [`UIPasteboard`](../ui-pasteboard.md)
