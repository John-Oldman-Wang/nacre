---
type: reference
native: CGSizeMake
---

# `CGSize()` constructor

The **`CGSize()`** constructor creates a size.

## Syntax

```
new CGSize([width[, height]])
```

### Parameters

**`width`**

The width, in [pt](../units.md).

**`height`**

The height, in pt.

Each argument is converted to a number:

- When omitted (`undefined`), the field is 0.
- Values that can be converted to a number (`'3'`, `null`, `true`) are used as the result of `Number()`: `3`, `0`, `1`. Type checking reports an error, so writing it this way is not recommended.

### Return value

A new `CGSize`. Its fields are read-only; see [Structs](../structs.md#fields-are-read-only-replace-the-whole-struct-to-change-one).

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number (`NaN`, `Infinity`, `'abc'`): `a struct field must be a finite number, got NaN`, ending with the value received.

## Examples

```js
const s = new CGSize(100, 50);
console.log(String(s));
```

**Result**: Prints `CGSize(100, 50)`.

## Corresponding iOS API

`CGSizeMake`.

## See also

- [Structs](../structs.md): the rules shared by all structs: fields are read-only, a plain object can be given when writing, and reads return a new object
