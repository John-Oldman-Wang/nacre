---
type: reference
native: UISlider.minimumValueImage
---

# `UISlider`: `minimumValueImage` property

The **`minimumValueImage`** property is an image drawn outside the left end of the track, for example, the speaker at the left end of a volume slider.

## Value

[`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- Defaults to `null`: no image.
- The object you write reads back as is: what you read is the same `UIImage` you wrote.
- Writing `null` removes the image.
- After an image is set, the track gets shorter to make room for it. Read the image's position with [`minimumValueImageRectForBounds()`](minimumvalueimagerectforbounds.md). **The shortened track is not verified in the simulator.**

This property has no change notification; only your code changes it.

### Invalid values

Writing something that is neither a `UIImage` nor `null` (for example, an icon name string or a `UIColor`) throws `TypeError`, and the property keeps its previous image:

```
TypeError: minimumValueImage needs a UIImage or null
```

## Examples

```js
const slider = new UISlider();
slider.minimumValueImage = UIImage.systemImageNamed('speaker.fill');
```

**Effect**: Outside the left end of the track is a small speaker, and the track is shortened accordingly. **Not verified in the simulator.**

`systemImageNamed()` gets an SF Symbol, the system's built-in set of icons; see [`UIImage`](../ui-image.md).

## Corresponding iOS API

`UISlider.minimumValueImage`.

## See also

- [`maximumValueImage`](maximumvalueimage.md)
- [`minimumValueImageRectForBounds()`](minimumvalueimagerectforbounds.md)
