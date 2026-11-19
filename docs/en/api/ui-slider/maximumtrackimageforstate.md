---
type: reference
native: "-[UISlider maximumTrackImageForState:]"
---

# `UISlider`: `maximumTrackImageForState()` method

The **`maximumTrackImageForState()`** method returns the image of the track to the right of the thumb that the slider uses in a given state.

## Syntax

```
maximumTrackImageForState(state)
```

### Parameters

**`state`**

One state name, a string: one of `'normal'`, `'highlighted'`, `'disabled'`, `'selected'`, `'focused'`. Only one can be passed, not an array.

### Return value

[`UIImage`](../ui-image.md), or `null`.

- It returns the object that was set with [`setMaximumTrackImage()`](setmaximumtrackimage.md).
- When this state hasn't been set separately, it returns the image for the `normal` state (measured).
- When `normal` hasn't been set either, it returns `null`. A new slider returns `null` for every state.

### Exceptions

**`TypeError`**

`state` is not one of the state names above.

## Examples

```js
const slider = new UISlider();
const star = UIImage.systemImageNamed('star.fill');
const circle = UIImage.systemImageNamed('circle.fill');
slider.setMaximumTrackImage(star, { forState: ['normal'] });
slider.setMaximumTrackImage(circle, { forState: ['highlighted'] });

console.log(slider.maximumTrackImageForState('normal') === star);
console.log(slider.maximumTrackImageForState('highlighted') === circle);
console.log(slider.maximumTrackImageForState('disabled') === star);
```

**Result**: Prints `true` three times. `disabled` hasn't been set separately, so it returns the `normal` image.

## Corresponding iOS API

`-[UISlider maximumTrackImageForState:]`.

## See also

- [`setMaximumTrackImage()`](setmaximumtrackimage.md)
- [`currentMaximumTrackImage`](currentmaximumtrackimage.md)
