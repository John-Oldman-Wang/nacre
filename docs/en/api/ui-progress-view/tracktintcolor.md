---
type: reference
native: UIProgressView.trackTintColor
---

# `UIProgressView`: `trackTintColor` property

The **`trackTintColor`** property is the color of the progress bar's unfilled portion.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- Defaults to `null`: not set separately, so the system default color is used.
- A valid color you write reads back as is. You can also write a `UIColor` object, which reads back as a color string; for example, writing `UIColor.systemRedColor` reads back `'systemRed'`.
- Writing `null` restores the system default color.
- Either this or [`trackImage`](trackimage.md), not both: writing a color sets `trackImage` to `null`. Writing `null` to the color doesn't affect the image; see [Color or image, not both](../ui-progress-view.md#color-or-image-not-both).
- How the color looks on screen is **not verified in the simulator**.
- There is no change event. Only the app's own code changes it.

### Invalid values

Writing an invalid color doesn't throw; a warning is printed to the console and the color keeps its previous value. See [Colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const bar = new UIProgressView();
bar.trackTintColor = '#E5E5EA';
console.log(bar.trackTintColor);
```

**Result**: Prints `#E5E5EA`. The progress bar's unfilled portion takes this color.

## Corresponding iOS API

`UIProgressView.trackTintColor`. A `UIColor` object in ObjC; here it reads back as a color string.

## See also

- [`trackImage`](trackimage.md): using an image instead of a color
- [Colors](../ui-color.md): how to write color strings
