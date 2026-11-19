---
type: reference
native: UIScrollView.scrollEnabled
---

# `UIScrollView`: `isScrollEnabled` property

The **`isScrollEnabled`** property indicates whether the user can drag the scroll view.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The user can drag |
| `false` | The user cannot drag. Writing `contentOffset` from code still works |

- Readable and writable.
- Defaults to `true`.
- On a [`UITextView`](../ui-text-view.md), after writing `false`, it no longer scrolls and instead becomes as tall as its lines of text.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.isScrollEnabled = false;
```

**Effect**: the user cannot drag. Setting it back to `true` restores dragging.

## Corresponding iOS API

`UIScrollView.scrollEnabled` (the getter is `isScrollEnabled`).

## See also

- [`bounces`](bounces.md)
