---
type: reference
native: UIBarItem.tag
---

# `UIBarItem`: `tag` property

The **`tag`** property is a number for your own use. The system ignores it.

## Value

An integer.

- Readable and writable.
- The default is `0`.
- Converted with `Number(v)` on write and then truncated toward zero; values that cannot be converted to a finite number throw `TypeError`.
- No event fires when it changes: only code changes it.

## Examples

```js
const item = new UIBarButtonItem({ title: 'Second' });
item.tag = 2;
console.log(item.tag);
```

**Result**: The console prints `2`.

## Corresponding iOS API

`UIBarItem.tag`.

## See also

- [`UIBarItem`](../ui-bar-item.md)
