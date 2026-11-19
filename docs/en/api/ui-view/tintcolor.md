---
type: reference
native: UIView.tintColor
---

# `UIView`: `tintColor` property

The **`tintColor`** property is the view's tint color: system buttons' text, template images, and controls such as switches are colored with it. A subview that doesn't set its own inherits its superview's.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- Accepts a color string or a `UIColor` object when written. A color name reads back unchanged (verified by testing).
- Writing `null` means not setting one and using the superview's. The default read from a new view is **not verified in the simulator**.
- Works the same on subclasses ([`UIButton`](../ui-button.md), [`UITextField`](../ui-text-field.md), and so on) (verified by testing).
- Subviews inheriting the superview's tint color is **not verified in the simulator**.

### Invalid values

Writing an invalid color doesn't throw. A warning is logged and the color keeps its previous value.

## Examples

```js
const parent = new UIView();
const child = UIButton.buttonWithType('system');
child.setTitle('Submit', { forState: ['normal'] });
parent.addSubview(child);

parent.tintColor = 'systemRed';
console.log(parent.tintColor);
```

**Effect**: `child`'s text appears red (**not verified in the simulator**). Logs `systemRed`.

## Corresponding iOS API

`UIView.tintColor`.

## See also

- [`tintAdjustmentMode`](tintadjustmentmode.md)
- [Colors](../ui-color.md)
