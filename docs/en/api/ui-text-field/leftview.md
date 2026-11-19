---
type: reference
native: UITextField.leftView
---

# `UITextField`: `leftView` property

The **`leftView`** property is a view shown at the left end of the field, such as an icon. When it is shown is decided by [`leftViewMode`](leftviewmode.md).

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- Reading it back returns the same object that was written. (Measured.)
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that is not a view throws `TypeError`. (Measured.)

## Examples

```js
const field = new UITextField();
const icon = new UIImageView();
icon.image = UIImage.systemImageNamed('magnifyingglass');
field.leftView = icon;
field.leftViewMode = 'always';
console.log(field.leftView === icon);
```

**Effect**: A magnifying glass is always shown at the left end of the text field. The console prints `true`. The icon's position is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.leftView`.

## See also

- [`leftViewMode`](leftviewmode.md)
- [`leftViewRectForBounds()`](leftviewrectforbounds.md)
