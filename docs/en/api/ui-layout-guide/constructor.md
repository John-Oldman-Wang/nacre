---
type: reference
native: "-[UILayoutGuide init]"
---

# `UILayoutGuide()` constructor

The **`UILayoutGuide()`** constructor creates a layout guide: a rectangle that takes part in layout but isn't displayed.

## Syntax

```
new UILayoutGuide()
```

### Parameters

None.

### Return value

A new `UILayoutGuide`. It doesn't belong to any view yet, and [`owningView`](owningview.md) is `null`. Add it to a view with the view's [`addLayoutGuide()`](../ui-view/addlayoutguide.md) before creating constraints with it.

### Exceptions

**`TypeError`**

`UILayoutGuide` can't be subclassed: after `class X extends UILayoutGuide {}`, `new X()` throws; see [Native classes](../native-classes.md).

## Examples

```js
const card = new UIView();
const guide = new UILayoutGuide();
card.addLayoutGuide(guide);
console.log(guide.owningView === card);
```

**Result**: logs `true`.

## Corresponding iOS API

`[[UILayoutGuide alloc] init]`.

## See also

- [`addLayoutGuide()`](../ui-view/addlayoutguide.md)
