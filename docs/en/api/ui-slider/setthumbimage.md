---
type: reference
native: "-[UISlider setThumbImage:forState:]"
---

# `UISlider`: `setThumbImage()` method

The **`setThumbImage()`** method sets the thumb image for one or more of the slider's [states](../ui-control.md#states), replacing the system-drawn appearance.

## Syntax

```
setThumbImage(image, { forState })
```

### Parameters

**`image`**

[`UIImage`](../ui-image.md), or `null`. `null` removes the image for these states.

**`options.forState`**

An array of state names, required. Usually `['normal']`: states that haven't been set separately use the `normal` image. The state names are `'normal'`, `'highlighted'` (finger pressing), `'disabled'`, `'selected'`, and `'focused'`; see [States](../ui-control.md#states).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forState` not passed: `setThumbImage needs { forState }`.
- `forState` contains an unrecognized state name: `forState has no value "pressed"; expected one of: normal / highlighted / disabled / selected / focused`.
- `image` is neither a `UIImage` nor `null`: `setThumbImage needs a UIImage or null`.

## Examples

```js
const slider = new UISlider();
const dot = UIImage.systemImageNamed('circle.fill');
slider.setThumbImage(dot, { forState: ['normal'] });
console.log(slider.thumbImageForState('normal') === dot);
console.log(slider.thumbImageForState('highlighted') === dot);
```

**Effect**

- Prints `true` twice: `highlighted` hasn't been set separately, so it uses the `normal` image.
- The thumb is displayed as this image. **Not verified in the simulator.**

## Corresponding iOS API

`-[UISlider setThumbImage:forState:]`. The state is a bitmask in ObjC; here it is written as an array.

## See also

- [`thumbImageForState()`](thumbimageforstate.md): reading the image for a state
- [`currentThumbImage`](currentthumbimage.md): the image used for the current state
- [`setMinimumTrackImage()`](setminimumtrackimage.md), [`setMaximumTrackImage()`](setmaximumtrackimage.md)
