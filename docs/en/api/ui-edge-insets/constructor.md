---
type: reference
native: UIEdgeInsetsMake
---

# `UIEdgeInsets()` constructor

The **`UIEdgeInsets()`** constructor creates a set of insets.

## Syntax

```
new UIEdgeInsets([top[, left[, bottom[, right]]]])
```

### Parameters

**`top`**, **`left`**, **`bottom`**, **`right`**

How far each of the top, left, bottom, and right edges is inset, in [pt](../units.md). The four arguments start from the top edge and go counterclockwise.

Each argument is converted to a number:

- When omitted (`undefined`), the field is 0.
- Values that can be converted to a number (`'3'`, `null`, `true`) are used as the result of `Number()`: `3`, `0`, `1`. Type checking reports an error, so writing it this way is not recommended.

### Return value

A new `UIEdgeInsets`. Its fields are read-only; see [Structs](../structs.md#fields-are-read-only-replace-the-whole-struct-to-change-one).

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number (`NaN`, `Infinity`, `'abc'`): `a struct field must be a finite number, got NaN`, ending with the value received.

## Examples

```js
const insets = new UIEdgeInsets(8, 16, 8, 16);
console.log(String(insets));
```

**Result**: Prints `UIEdgeInsets(8, 16, 8, 16)`.

## Corresponding iOS API

`UIEdgeInsetsMake`.

## See also

- [`NSDirectionalEdgeInsets`](../ns-directional-edge-insets.md): insets whose left and right swap with text direction
- [Structs](../structs.md): the rules shared by all structs: fields are read-only, a plain object can be given when writing, and reads return a new object
