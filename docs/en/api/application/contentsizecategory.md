---
type: reference
native: UIApplication.preferredContentSizeCategory
---

# `Application`: `contentSizeCategory` property

The **`contentSizeCategory`** property is the text size level the user chose in Settings.

## Value

A string. The value is iOS's raw string, such as `'UICTContentSizeCategoryL'`. `L` is the default level.

- Read-only. Assigning to it throws `TypeError`.
- Fires [`contentsizecategorychange`](contentsizecategorychange-event.md) when it changes.
- It can't yet be read as a unified name such as `'large'`.

## Examples

```js
console.log(application.contentSizeCategory);
```

**Result**: prints `UICTContentSizeCategoryL` when the text size is at the default level.

## Corresponding iOS API

`UIApplication.preferredContentSizeCategory`.

## See also

- [`contentsizecategorychange`](contentsizecategorychange-event.md)
