---
type: reference
native: UITextField.rightView
---

# `UITextField`: `rightView` property

The **`rightView`** property is a view shown at the right end of the field, such as an icon. When it is shown is decided by [`rightViewMode`](rightviewmode.md).

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- Reading it back returns the same object that was written. **Not verified in the simulator.**
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that is not a view throws `TypeError`. **Not verified in the simulator.**

## Examples

```js
const field = new UITextField();
const icon = new UIImageView();
icon.image = UIImage.systemImageNamed('magnifyingglass');
field.rightView = icon;
field.rightViewMode = 'always';
console.log(field.rightView === icon);
```

**Effect**: A magnifying glass is always shown at the right end of the text field. The console prints `true`. The icon's position is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.rightView`.

## See also

- [`rightViewMode`](rightviewmode.md)
- [`rightViewRectForBounds()`](rightviewrectforbounds.md)
