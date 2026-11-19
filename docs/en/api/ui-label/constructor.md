---
type: reference
native: "-[UILabel init]"
---

# `UILabel()` constructor

The **`UILabel()`** constructor creates a label.

## Syntax

```
new UILabel()
```

### Parameters

None.

### Return value

The new `UILabel`:

- [`text`](text.md) is `null`.
- `frame` is `(0, 0, 0, 0)`.
- It has no superview.

When positioning with constraints, you do not need to give a width and height; the label calculates its own size from its text. When positioning with `frame`, you must give a width and height, or the text cannot be seen; see [Intrinsic size](../ui-label.md#intrinsic-size).

### Exceptions

**`TypeError`**

`UILabel` cannot be subclassed. After `class Title extends UILabel {}`, `new Title()` throws:

```
TypeError: Illegal constructor: Title extends UILabel, but subclassing native classes is not supported yet
```

To attach your own logic to a label, use composition; see [Native classes](../native-classes.md).

## Examples

```js
const label = new UILabel();
console.log(label.text);
label.text = 'Hello';
console.log(label.text);
```

**Result**: Prints `null`, then `Hello`.

## Corresponding iOS API

`[[UILabel alloc] init]`.

## See also

- [`text`](text.md)
- [Displaying text](../../guides/labels.md)
