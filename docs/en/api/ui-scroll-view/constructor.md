---
type: reference
native: "-[UIScrollView init]"
---

# `UIScrollView()` constructor

The **`UIScrollView()`** constructor creates a scroll view.

## Syntax

```
new UIScrollView()
```

### Parameters

None.

### Return value

A new `UIScrollView`. Its size is 0 and so is its content area; position and size must be set with constraints or `frame`.

### Exceptions

**`TypeError`**

`UIScrollView` cannot be subclassed; with `class X extends UIScrollView {}`, `new X()` throws. See [Native classes](../native-classes.md#no-subclassing).

## Examples

```js
const scroller = new UIScrollView();
console.log(scroller.contentSize.width, scroller.contentSize.height);
```

**Result**: logs `0 0`.

## Corresponding iOS API

`[[UIScrollView alloc] init]`.

## See also

- [Building a scrolling view](../../guides/scrolling.md)
