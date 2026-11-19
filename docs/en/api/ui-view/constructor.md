---
type: reference
native: "-[UIView init]"
---

# `UIView()` constructor

The **`UIView()`** constructor creates a view.

## Syntax

```
new UIView()
```

### Parameters

None.

### Return value

A new `UIView`. Its [`frame`](frame.md) is `(0, 0, 0, 0)`, with no background color and no superview. Unless these three are changed, it isn't visible on screen. See [Why a new view isn't visible](../../guides/views.md#why-a-new-view-is-invisible).

Creating a view doesn't require a scene or a window. You can create it at any time and add it to the view hierarchy later.

### Exceptions

**`TypeError`**

`UIView` can't be subclassed. After `class Card extends UIView {}`, `new Card()` throws `TypeError: Illegal constructor: Card extends UIView, but subclassing native classes is not supported yet`. To attach your own logic to a view, use composition. See [Native classes](../native-classes.md).

## Examples

```js
const view = new UIView();
console.log(String(view.frame), view.backgroundColor, view.superview);
```

**Result**: Prints `CGRect(0, 0, 0, 0) null null`.

## Corresponding iOS API

`[[UIView alloc] init]`. `[[UIView alloc] initWithFrame:rect]` is written as `new UIView()` followed by assigning `frame`.

## See also

- [Placing views on screen](../../guides/views.md)
