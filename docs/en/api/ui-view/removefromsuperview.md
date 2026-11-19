---
type: reference
native: "-[UIView removeFromSuperview]"
---

# `UIView`: `removeFromSuperview()` method

The **`removeFromSuperview()`** method removes the view from its superview.

## Syntax

```
removeFromSuperview()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

Whether calling it on a view without a superview throws is **not verified in the simulator**.

## Description

- Whether the view still exists after removal depends on whether the app's code holds a reference to it. If a variable holds it, the view stays alive with all its properties, and you can add it back with `addSubview()` (**adding it back is not verified in the simulator**). If no variable holds it, the view is reclaimed together with its subviews and event listeners; you don't need to call `removeEventListener()` first.
- Constraints involving it are removed along with it. **Not verified in the simulator.**
- Use this method to remove an arranged subview of a [`UIStackView`](../ui-stack-view.md) too; it also takes the view out of the arrangement.

## Examples

```js
const card = new UIView();
const dot = new UIView();
card.addSubview(dot);

dot.removeFromSuperview();
console.log(dot.superview, card.subviews.length);
```

**Effect**: `dot` disappears from the screen. Logs `null 0`.

## Corresponding iOS API

`-[UIView removeFromSuperview]`.

## See also

- [`addSubview()`](addsubview.md)
- [`isHidden`](ishidden.md): hide temporarily
- [Who keeps a view alive](../../guides/views.md#who-keeps-a-view)
