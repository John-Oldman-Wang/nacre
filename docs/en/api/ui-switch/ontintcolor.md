---
type: reference
native: UISwitch.onTintColor
---

# `UISwitch`: `onTintColor` property

The **`onTintColor`** property is the color of the track when the switch is on.

## Value

A color string, or `null`.

- Readable and writable.
- The default is `null`, meaning the system green.
- Writing a color string reads back the same string, for example writing `'#34c759'` reads back `'#34c759'`. For how to write colors, see [colors](../ui-color.md).
- Writing a `UIColor` object also works; it reads back as the color name, for example writing `UIColor.systemRedColor` reads back `'systemRed'`.
- Writing `null` returns to the system default color.
- The color of the track when off isn't affected by it.

This property has no change notification; only your code changes it.

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning, and the property keeps its old value.

```
[Nacre] onTintColor: "not-a-color" is not a valid color, ignored
```

When what you wrote looks like a color name (only letters and digits), the warning also lists all valid color names.

## Examples

```js
const sw = new UISwitch();
sw.isOn = true;
sw.onTintColor = '#5856D6';
```

**Effect**: The switch's track is purple. **Not verified in the simulator.**

## Corresponding iOS API

`UISwitch.onTintColor`.

## See also

- [`thumbTintColor`](thumbtintcolor.md): the color of the thumb
- [Colors](../ui-color.md)
