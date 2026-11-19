---
type: reference
native: "-[UIButton setBackgroundImage:forState:]"
---

# `UIButton`: `setBackgroundImage()` method

The **`setBackgroundImage()`** method sets the background image for one or more of the button's states. The background image fills the whole button and is shown behind the title and image. The button displays the one for its current state.

## Syntax

```
setBackgroundImage(value, { forState })
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

- `forState` not passed: `setBackgroundImage needs { forState }`.
- `forState` contains an unrecognized state name: `forState has no value "pressed"; expected one of: …`, followed by all state names.
- `value` is neither a `UIImage` nor `null`.


## Examples

```js
const button = new UIButton();
const background = UIImage.imageNamed('button-bg');
if (background) {
  button.setBackgroundImage(background, { forState: ['normal'] });
}
```

**Effect**: The button's background is filled with the `button-bg` image. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIButton setBackgroundImage:forState:]`. In ObjC the state is the bitmask `UIControlStateSelected | UIControlStateDisabled`; here it is the array `['selected', 'disabled']`.

## See also

- [`backgroundImageForState()`](backgroundimageforstate.md)
- [States](../ui-button.md#states)
