---
type: reference
native: UISlider.thumbTintColor
---

# `UISlider`: `thumbTintColor` property

The **`thumbTintColor`** property is the color of the slider's thumb.

## Value

A color string, or `null`.

- Readable and writable.
- Defaults to `null`, which means the system default color is used.
- When you write a color string, the same string reads back, for example writing '#FFFFFF' reads back '#FFFFFF'. For the syntax, see [Colors](../ui-color.md).
- You can also write a `UIColor` object; it reads back as the color name.
- Writing `null` returns to the system default color.

This property has no change notification; only your code changes it.

### Invalid values

Writing an invalid color doesn't throw; a warning is printed to the console and the property keeps its previous value.

```
[Nacre] thumbTintColor: "not-a-color" is not a valid color, ignored
```

When what you wrote looks like a color name (only letters and digits), the warning also lists every available color name.

## Examples

```js
const slider = new UISlider();
slider.thumbTintColor = '#FFFFFF';
```

**Effect**: The thumb is white. **Not verified in the simulator.**

## Corresponding iOS API

`UISlider.thumbTintColor`.

## See also

- [`minimumTrackTintColor`](minimumtracktintcolor.md): the color of the track
- [Colors](../ui-color.md)
