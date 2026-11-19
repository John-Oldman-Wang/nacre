---
type: reference
native: "-[UIToolbar init]"
---

# `UIToolbar()` constructor

The **`UIToolbar()`** constructor creates an empty toolbar.

## Syntax

```
new UIToolbar()
```

### Parameters

None.

### Return value

A new `UIToolbar`. Its `frame` is 0 × 0 and [`items`](items.md) is an empty array. Its own preferred height is 48 pt; see [Size](../ui-toolbar.md#size).

### Exceptions

**`TypeError`**

`UIToolbar` can't be subclassed; `class X extends UIToolbar` throws on `new X()`. See [Native classes](../native-classes.md#no-subclassing).

## Examples

```js
const toolbar = new UIToolbar();
console.log(toolbar.items.length);
console.log(toolbar.intrinsicContentSize.height);
```

**Result**: prints `0`, then `48`.

## Corresponding iOS API

`[[UIToolbar alloc] init]`.

## See also

- [`items`](items.md): putting buttons on the toolbar
