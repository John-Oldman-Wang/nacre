---
type: reference
native: UITextField.background
---

# `UITextField`: `background` property

The **`background`** property is the text field's background image.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- According to Apple's documentation, once it is set, the image is not shown when `borderStyle` is `'roundedRect'`. **Not verified in the simulator.**
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.borderStyle = 'none';
field.background = UIImage.systemImageNamed('rectangle');
```

**Effect**: The text field uses this image as its background. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.background`.

## See also

- [`borderStyle`](borderstyle.md)
