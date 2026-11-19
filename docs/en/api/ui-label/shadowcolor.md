---
type: reference
native: UILabel.shadowColor
---

# `UILabel`: `shadowColor` property

The **`shadowColor`** property is the color of the text shadow. A text shadow is an extra copy of each character drawn beside it, with a sharp edge and no blur.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- The default is `null`, meaning no shadow.
- Accepts a color string or a `UIColor` object on write. The string read back is the same as the one written.
- The shadow's position is set by [`shadowOffset`](shadowoffset.md).
- Text shadows have no blur radius. For a shadow with a blurred edge, use the layer's shadow properties; see [`CALayer`](../ca-layer.md).

### Invalid values

Writing an invalid color does not throw. The console prints a warning and the color keeps its previous value:

```
[Nacre] shadowColor: "#GGG" is not a valid color, ignored
```

## Examples

```js
const label = new UILabel();
label.text = 'Title';
label.shadowColor = 'rgba(0,0,0,.25)';
label.shadowOffset = new CGSize(0, 2);
```

**Effect**: 2 pt directly below each character is an extra copy of the same shape in translucent black. **Not verified in the simulator.**

## Corresponding iOS API

`UILabel.shadowColor`. In ObjC it is a `UIColor` object; here it is written as a string.

## See also

- [`shadowOffset`](shadowoffset.md)
- [`UIColor`](../ui-color.md)
