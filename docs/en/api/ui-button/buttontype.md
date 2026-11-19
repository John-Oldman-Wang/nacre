---
type: reference
native: UIButton.buttonType
---

# `UIButton`: `buttonType` property

The **`buttonType`** property is the button's type. It is fixed when the button is created and doesn't change afterward.

## Value

A string; for the values, see [`buttonWithType()`](buttonwithtype.md#parameters).

- Read-only. Assigning to it throws `TypeError`.
- A button created with `buttonWithType('system')` reads `'system'`; one created with `new UIButton()` reads `'custom'` (**not verified in the simulator**).

## Examples

```js
const button = UIButton.buttonWithType('system');
console.log(button.buttonType);
```

**Result**: Prints `system`.

## Corresponding iOS API

`UIButton.buttonType`.

## See also

- [`UIButton.buttonWithType()`](buttonwithtype.md)
