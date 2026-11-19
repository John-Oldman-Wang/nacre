---
type: reference
native: UIProgressView.trackImage
---

# `UIProgressView`: `trackImage` property

The **`trackImage`** property is the image used for the progress bar's unfilled portion.

## Value

[`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- Defaults to `null`.
- It reads back as the same object you wrote.
- Writing `null` removes the image.
- Either this or [`trackTintColor`](tracktintcolor.md), not both: writing an image sets `trackTintColor` to `null`; writing a color afterward sets the image to `null`. See [Color or image, not both](../ui-progress-view.md#color-or-image-not-both).
- How the image is stretched and cropped is **not verified in the simulator**.
- There is no change event. Only the app's own code changes it.

### Invalid values

Writing a value other than a `UIImage` or `null` throws `TypeError`, and the previous value is unchanged:

- Writing another native object (for example a `UIColor`): `trackImage needs a UIImage or null`.
- Writing a plain value such as a string: `trackImage needs a native object or null, got "star.fill"`.

## Examples

```js
const bar = new UIProgressView();
bar.trackTintColor = 'systemRed';
const star = UIImage.systemImageNamed('star.fill');
if (star) bar.trackImage = star;
console.log(bar.trackTintColor);
```

**Result**: Prints `null`. Writing the image made the system clear the color just written, and the unfilled portion uses this image instead.

## Corresponding iOS API

`UIProgressView.trackImage`.

## See also

- [`trackTintColor`](tracktintcolor.md)
- [`UIImage`](../ui-image.md): where images come from
