---
type: reference
native: "-[UIImageView init]"
---

# `UIImageView()` constructor

The **`UIImageView()`** constructor creates an image view with no image.

## Syntax

```
new UIImageView()
```

### Parameters

None.

### Return value

A new `UIImageView`. [`image`](image.md) is `null`, the position is `(0, 0)`, and the width and height are 0.

When positioned with constraints, it needs no width and height and is the same size as the image; when positioned with `frame`, give it a width and height, or the image isn't visible. See [Image view size](../ui-image-view.md#image-view-size).

### Exceptions

**`TypeError`**

`UIImageView` can't be subclassed; after `class X extends UIImageView {}`, `new X()` throws. See [Native classes](../native-classes.md).

## Examples

```js
const avatar = new UIImageView();
console.log(avatar.image);
```

**Result**: the console logs `null`.

## Corresponding iOS API

`[[UIImageView alloc] init]`.

## See also

- [`image`](image.md)
