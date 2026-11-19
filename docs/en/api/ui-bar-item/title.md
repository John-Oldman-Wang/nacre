---
type: reference
native: UIBarItem.title
---

# `UIBarItem`: `title` property

The **`title`** property is the text on a navigation bar button or tab.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`. For a button created with the constructor argument `{ title }`, it is the value given.
- Values that are not strings are converted with `String()`; writing `null` or `undefined` gives `null`.
- A button that uses [`customView`](../ui-bar-button-item/customview.md) does not show it.
- No event fires when it changes: only code changes it.

## Examples

```js
const item = new UIBarButtonItem();
console.log(item.title);
item.title = 'Done';
console.log(item.title);
```

**Result**: First prints `null`, then `Done`.

## Corresponding iOS API

`UIBarItem.title`.

## See also

- [`image`](image.md)
