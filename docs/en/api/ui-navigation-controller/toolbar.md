---
type: reference
native: UINavigationController.toolbar
---

# `UINavigationController`: `toolbar` property

The **`toolbar`** property is the bottom toolbar managed by the navigation controller itself, a [`UIToolbar`](../ui-toolbar.md).

## Value

A [`UIToolbar`](../ui-toolbar.md); always has a value.

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.
- The toolbar is hidden by default; to show it, use [`isToolbarHidden`](istoolbarhidden.md) or [`setToolbarHidden()`](settoolbarhidden.md).

> **Note:** Apple specifies that this toolbar is managed by the navigation controller; don't change its `items` directly.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
console.log(nav.toolbar instanceof UIToolbar);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UINavigationController.toolbar`.

## See also

- [`isToolbarHidden`](istoolbarhidden.md)
- [`UIToolbar`](../ui-toolbar.md)
