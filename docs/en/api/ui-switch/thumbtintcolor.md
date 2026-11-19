---
type: reference
native: UISwitch.thumbTintColor
---

# `UISwitch`: `thumbTintColor` property

The **`thumbTintColor`** property is the color of the switch's thumb.

## Value

A color string, or `null`.

- Readable and writable.
- The default is `null`, meaning the system default color.
- Writing a color string reads back the same string, for example writing `'rgba(255, 255, 255, 0.5)'` reads back the same string. For how to write colors, see [colors](../ui-color.md).
- Writing a `UIColor` object also works; it reads back as the color name.
- Writing `null` returns to the system default color.

This property has no change notification; only your code changes it.

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning, and the property keeps its old value.

```
[Nacre] thumbTintColor: "not-a-color" is not a valid color, ignored
```

## Examples

```js
const sw = new UISwitch();
sw.thumbTintColor = '#FFCC00';
```

**Effect**: The thumb is yellow. **Not verified in the simulator.**

## Corresponding iOS API

`UISwitch.thumbTintColor`.

## See also

- [`onTintColor`](ontintcolor.md): the color of the track when on
- [Colors](../ui-color.md)
