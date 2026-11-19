---
type: reference
native: UITextField.disabledBackground
---

# `UITextField`: `disabledBackground` property

The **`disabledBackground`** property is the text field's background image when it is disabled.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- According to Apple's documentation, it takes effect only when [`background`](background.md) is set. **Not verified in the simulator.**
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.borderStyle = 'none';
field.disabledBackground = UIImage.systemImageNamed('rectangle');
```

**Effect**: When the text field is disabled, it uses this image as its background. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.disabledBackground`.

## See also

- [`borderStyle`](borderstyle.md)
