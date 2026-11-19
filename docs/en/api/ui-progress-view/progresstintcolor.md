---
type: reference
native: UIProgressView.progressTintColor
---

# `UIProgressView`: `progressTintColor` property

The **`progressTintColor`** property is the color of the progress bar's filled portion.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- Defaults to `null`: not set separately, so the system default color is used.
- A valid color you write reads back as is. You can also write a `UIColor` object, which reads back as a color string; for example, writing `UIColor.systemRedColor` reads back `'systemRed'`.
- Writing `null` restores the system default color.
- Either this or [`progressImage`](progressimage.md), not both: writing a color sets `progressImage` to `null`. Writing `null` to the color doesn't affect the image; see [Color or image, not both](../ui-progress-view.md#color-or-image-not-both).
- How the color looks on screen is **not verified in the simulator**.
- There is no change event. Only the app's own code changes it.

### Invalid values

Writing an invalid color doesn't throw; a warning is printed to the console and the color keeps its previous value. See [Colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const bar = new UIProgressView();
bar.progressTintColor = 'systemGreen';
console.log(bar.progressTintColor);
```

**Result**: Prints `systemGreen`. The progress bar's filled portion takes this color.

## Corresponding iOS API

`UIProgressView.progressTintColor`. A `UIColor` object in ObjC; here it reads back as a color string.

## See also

- [`progressImage`](progressimage.md): using an image instead of a color
- [Colors](../ui-color.md): how to write color strings
