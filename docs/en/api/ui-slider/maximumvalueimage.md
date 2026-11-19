---
type: reference
native: UISlider.maximumValueImage
---

# `UISlider`: `maximumValueImage` property

The **`maximumValueImage`** property is an image drawn outside the right end of the track, for example, the speaker at the right end of a volume slider.

## Value

[`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- Defaults to `null`: no image.
- The object you write reads back as is: what you read is the same `UIImage` you wrote.
- Writing `null` removes the image.
- After an image is set, the track gets shorter to make room for it. Read the image's position with [`maximumValueImageRectForBounds()`](maximumvalueimagerectforbounds.md). **The shortened track is not verified in the simulator.**

This property has no change notification; only your code changes it.

### Invalid values

Writing something that is neither a `UIImage` nor `null` (for example, an icon name string or a `UIColor`) throws `TypeError`, and the property keeps its previous image:

```
TypeError: maximumValueImage needs a UIImage or null
```

## Examples

```js
const slider = new UISlider();
slider.maximumValueImage = UIImage.systemImageNamed('speaker.wave.3.fill');
```

**Effect**: Outside the right end of the track is a speaker with sound waves, and the track is shortened accordingly. **Not verified in the simulator.**

`systemImageNamed()` gets an SF Symbol, the system's built-in set of icons; see [`UIImage`](../ui-image.md).

## Corresponding iOS API

`UISlider.maximumValueImage`.

## See also

- [`minimumValueImage`](minimumvalueimage.md)
- [`maximumValueImageRectForBounds()`](maximumvalueimagerectforbounds.md)
