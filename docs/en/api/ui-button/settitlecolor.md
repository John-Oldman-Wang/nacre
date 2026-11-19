---
type: reference
native: "-[UIButton setTitleColor:forState:]"
---

# `UIButton`: `setTitleColor()` method

The **`setTitleColor()`** method sets the title color for one or more of the button's states. The button displays the one for its current state.

## Syntax

```
setTitleColor(value, { forState })
```

### Parameters

**`value`**

A [color](../ui-color.md): a color string (`'#FF3B30'`, `'systemRed'`) or a `UIColor` object. Passing `null` removes the setting for these states, and they go back to using the `normal` one. **The effect of passing `null` is not verified in the simulator.**

**`options.forState`**

An array of state names, required. Which states to set; see [States](../ui-button.md#states). When you set only `['normal']`, every state that hasn't been set separately uses it. For a value used only when several states hold at once, put all of those state names in the array, for example `['selected', 'disabled']`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forState` not passed: `setTitleColor needs { forState }`.
- `forState` contains an unrecognized state name: `forState has no value "pressed"; expected one of: …`, followed by all state names.


An invalid color string doesn't throw: a warning is printed to the console, and the color for these states stays unchanged.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Delete', { forState: ['normal'] });
button.setTitleColor('#FF3B30', { forState: ['normal'] });
```

**Effect**: The title turns red. It still fades automatically while a finger presses it.

## Corresponding iOS API

`-[UIButton setTitleColor:forState:]`. In ObjC the state is the bitmask `UIControlStateSelected | UIControlStateDisabled`; here it is the array `['selected', 'disabled']`.

## See also

- [`titleColorForState()`](titlecolorforstate.md)
- [Colors](../ui-color.md): how to write colors
- [States](../ui-button.md#states)
