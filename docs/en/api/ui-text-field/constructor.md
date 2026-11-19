---
type: reference
native: "-[UITextField init]"
---

# `UITextField()` constructor

The **`UITextField()`** constructor creates a single-line text field.

## Syntax

```
new UITextField()
```

### Parameters

None.

### Return value

A new `UITextField`. It has no border ([`borderStyle`](borderstyle.md) is `'none'`), no content, no placeholder, and a size of 0. Placed in a view controller, it gives no visible hint of where to tap; see [Why a new text field is invisible](../../guides/text-fields.md#why-a-new-text-field-is-invisible).

### Exceptions

**`TypeError`**

`UITextField` cannot be subclassed; `class X extends UITextField {}` throws on `new X()`. See [Native classes](../native-classes.md#no-subclassing).

## Examples

```js
const field = new UITextField();
console.log(JSON.stringify(field.text), field.placeholder, field.borderStyle);
```

**Result**: Prints `"" null none`.

## Corresponding iOS API

`[[UITextField alloc] init]`.

## See also

- [`borderStyle`](borderstyle.md): adding a border to a text field
