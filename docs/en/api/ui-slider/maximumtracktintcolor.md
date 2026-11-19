---
type: reference
native: UISlider.maximumTrackTintColor
---

# `UISlider`: `maximumTrackTintColor` property

The **`maximumTrackTintColor`** property is the color of the track to the right of the slider's thumb. It represents the part not yet selected.

## Value

A color string, or `null`.

- Readable and writable.
- Defaults to `null`, which means the system default color is used.
- When you write a color string, the same string reads back, for example writing 'systemGray' reads back 'systemGray'. For the syntax, see [Colors](../ui-color.md).
- You can also write a `UIColor` object; it reads back as the color name.
- Writing `null` returns to the system default color.

This property has no change notification; only your code changes it.

### Invalid values

Writing an invalid color doesn't throw; a warning is printed to the console and the property keeps its previous value.

```
[Nacre] maximumTrackTintColor: "not-a-color" is not a valid color, ignored
```

When what you wrote looks like a color name (only letters and digits), the warning also lists every available color name.

## Examples

```js
const slider = new UISlider();
slider.maximumTrackTintColor = 'systemGray';
```

**Effect**: The track to the right of the thumb is gray. **Not verified in the simulator.**

## Corresponding iOS API

`UISlider.maximumTrackTintColor`.

## See also

- [`minimumTrackTintColor`](minimumtracktintcolor.md): the color of the track to the left of the thumb
- [Colors](../ui-color.md)
