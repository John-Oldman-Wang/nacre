---
type: reference
native: "-[UIView endEditing:]"
---

# `UIView`: `endEditing()` method

The **`endEditing()`** method makes the text field being edited, in this view or its descendants, lose focus, and the keyboard is dismissed with it.

## Syntax

```
endEditing([force])
```

### Parameters

**`force`**

A boolean, optional; `false` when omitted. `false`: the text field may refuse to lose focus. `true`: forces it to lose focus.

### Return value

A boolean. `true` means the text field has lost focus.

### Exceptions

None.

## Examples

```js
const page = new UIView();
const field = new UITextField();
page.addSubview(field);
field.becomeFirstResponder();
page.endEditing(true);
```

**Effect**: The text field loses focus and the keyboard is dismissed.

## Corresponding iOS API

`-[UIView endEditing:]`.

## See also

- [Text fields and the keyboard](../ui-text-field.md)
- `becomeFirstResponder()`, `resignFirstResponder()`, `isFirstResponder`, and `canBecomeFirstResponder` are inherited from `UIResponder`; see [Text fields and the keyboard](../ui-text-field.md)
