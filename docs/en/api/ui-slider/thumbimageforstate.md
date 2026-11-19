---
type: reference
native: "-[UISlider thumbImageForState:]"
---

# `UISlider`: `thumbImageForState()` method

The **`thumbImageForState()`** method returns the thumb image that the slider uses in a given state.

## Syntax

```
thumbImageForState(state)
```

### Parameters

**`state`**

One state name, a string: one of `'normal'`, `'highlighted'`, `'disabled'`, `'selected'`, `'focused'`. Only one can be passed, not an array.

### Return value

[`UIImage`](../ui-image.md), or `null`.

- It returns the object that was set with [`setThumbImage()`](setthumbimage.md).
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
slider.setThumbImage(star, { forState: ['normal'] });
slider.setThumbImage(circle, { forState: ['highlighted'] });

console.log(slider.thumbImageForState('normal') === star);
console.log(slider.thumbImageForState('highlighted') === circle);
console.log(slider.thumbImageForState('disabled') === star);
```

**Result**: Prints `true` three times. `disabled` hasn't been set separately, so it returns the `normal` image.

## Corresponding iOS API

`-[UISlider thumbImageForState:]`.

## See also

- [`setThumbImage()`](setthumbimage.md)
- [`currentThumbImage`](currentthumbimage.md)
