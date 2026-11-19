---
type: reference
native: UISlider.sliderStyle
---

# `UISlider`: `sliderStyle` property

The **`sliderStyle`** property determines whether the slider has a thumb.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'default'` | Has a thumb |
| `'thumbless'` | No thumb; only a partly filled track remains. Typically used to show playback progress |

How both values look on screen is **not verified in the simulator**.

- Readable and writable.
- Defaults to `'default'`.

This property has no change notification; only your code changes it.

### Invalid values

Writing a value not in the table doesn't throw; a warning is printed to the console and the property keeps its previous value.

```
[Nacre] sliderStyle has no value "round"; expected one of: default / thumbless, ignored
```

## Examples

```js
const slider = new UISlider();
slider.sliderStyle = 'thumbless';
slider.value = 0.3;
```

**Effect**: The slider has no thumb, and about 30% of the track from the left is filled. **Not verified in the simulator.**

## Corresponding iOS API

`UISlider.sliderStyle`. `UISliderStyleThumbless` is written as `'thumbless'`.

## See also

- [Enums](../enums.md): why an invalid property write warns instead of throwing
