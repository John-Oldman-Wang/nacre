---
type: reference
native: NSDirectionalEdgeInsetsMake
---

# `NSDirectionalEdgeInsets()` constructor

The **`NSDirectionalEdgeInsets()`** constructor creates a set of directional insets.

## Syntax

```
new NSDirectionalEdgeInsets([top[, leading[, bottom[, trailing]]]])
```

### Parameters

**`top`**, **`leading`**, **`bottom`**, **`trailing`**

How far the top, the side where text starts, the bottom, and the side where text ends are each inset, in [pt](../units.md).

Each argument is converted to a number:

- When not given (`undefined`), the field is 0.
- Values that convert to numbers (`'3'`, `null`, `true`) use the result of `Number()`: `3`, `0`, `1`. Type checking reports an error, so writing them this way isn't recommended.

### Return value

A new `NSDirectionalEdgeInsets`. Its fields are read-only; see [Structs](../structs.md#fields-are-read-only-replace-the-whole-struct-to-change-one).

### Exceptions

**`TypeError`**

An argument doesn't convert to a finite number (`NaN`, `Infinity`, `'abc'`): `a struct field must be a finite number, got NaN`, ending with the value received.

## Examples

```js
const margins = new NSDirectionalEdgeInsets(8, 16, 8, 16);
console.log(String(margins));
```

**Result**: It prints `NSDirectionalEdgeInsets(8, 16, 8, 16)`.

## Corresponding iOS API

`NSDirectionalEdgeInsetsMake`.

## See also

- [`UIEdgeInsets`](../ui-edge-insets.md): insets with fixed left and right
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
