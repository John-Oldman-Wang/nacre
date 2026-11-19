---
type: reference
native: "-[UIButton setImage:forState:]"
---

# `UIButton`: `setImage()` method

The **`setImage()`** method sets the image for one or more of the button's states. The button displays the one for its current state.

## Syntax

```
setImage(value, { forState })
```

### Parameters

**`value`**

A [`UIImage`](../ui-image.md). Passing `null` removes the setting for these states, and they go back to using the `normal` one.

**`options.forState`**

An array of state names, required. Which states to set; see [States](../ui-button.md#states). When you set only `['normal']`, every state that hasn't been set separately uses it. For a value used only when several states hold at once, put all of those state names in the array, for example `['selected', 'disabled']`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forState` not passed: `setImage needs { forState }`.
- `forState` contains an unrecognized state name: `forState has no value "pressed"; expected one of: …`, followed by all state names.
- `value` is neither a `UIImage` nor `null`.


## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Favorite', { forState: ['normal'] });
button.setImage(UIImage.systemImageNamed('heart'), { forState: ['normal'] });
```

**Effect**: A heart icon appears to the left of the title, in the same color as the title. If you set only an image and no title, the button shows only the image. **The image's position and color are not verified in the simulator.**

## Corresponding iOS API

`-[UIButton setImage:forState:]`. In ObjC the state is the bitmask `UIControlStateSelected | UIControlStateDisabled`; here it is the array `['selected', 'disabled']`.

## See also

- [`imageForState()`](imageforstate.md)
- [`UIImage`](../ui-image.md): system icons and your own images
- [States](../ui-button.md#states)
