---
type: reference
native: UIGestureRecognizer.view
---

# `UIGestureRecognizer`: `view` property

The **`view`** property is the view the recognizer is attached to.

## Value

A [`UIView`](../ui-view.md) or `null`.

- Read-only; assigning to it throws `TypeError`. To attach a recognizer to a view, use the view's `addGestureRecognizer()`.
- The default is `null`: the recognizer is not attached to any view.
- A recognizer is on only one view at a time. When it is attached to another view, it is automatically removed from the original view, and `view` becomes the new view.

### Observing changes

No event fires when it changes. It changes only when the app's code calls `addGestureRecognizer()` or `removeGestureRecognizer()`.

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
console.log(tap.view);
card.addGestureRecognizer(tap);
console.log(tap.view === card);
```

**Result**: Prints `null`, then `true`.

## Corresponding iOS API

`UIGestureRecognizer.view`.

## See also

- [`UIView`](../ui-view.md): `addGestureRecognizer()`, `removeGestureRecognizer()`, `gestureRecognizers`
