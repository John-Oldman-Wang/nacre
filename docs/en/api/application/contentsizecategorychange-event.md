---
type: reference
native: UIContentSizeCategoryDidChangeNotification
---

# `Application`: `contentsizecategorychange` event

The **`contentsizecategorychange`** event fires when the user changes the system text size.

## Syntax

```
application.addEventListener('contentsizecategorychange', (event) => { })
```

## Event object

`Event`, with only the basic fields. Read the new value from [`application.contentSizeCategory`](contentsizecategory.md). Not cancelable.

## When it fires

- When the user changes the text size in Settings.
- Firing of this event is **not verified in the simulator**.

## Examples

```js
application.addEventListener('contentsizecategorychange', () => {
  console.log('Text size level is now', application.contentSizeCategory);
});
```

**Effect**: prints the new level after the user changes the system text size. **Not verified in the simulator.**

## Corresponding iOS API

`UIContentSizeCategoryDidChangeNotification`.

## See also

- [`contentSizeCategory`](contentsizecategory.md)
