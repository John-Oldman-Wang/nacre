---
type: reference
native: "-[UIButton setTitle:forState:]"
---

# `UIButton`: `setTitle()` method

The **`setTitle()`** method sets the title for one or more of the button's states. The button displays the one for its current state.

## Syntax

```
setTitle(value, { forState })
```

### Parameters

**`value`**

The title to display, a string. Passing `null` removes the setting for these states, and they go back to using the `normal` one. **The effect of passing `null` is not verified in the simulator.**

**`options.forState`**

An array of state names, required. Which states to set; see [States](../ui-button.md#states). When you set only `['normal']`, every state that hasn't been set separately uses it. For a value used only when several states hold at once, put all of those state names in the array, for example `['selected', 'disabled']`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forState` not passed: `setTitle needs { forState }`.
- `forState` contains an unrecognized state name: `forState has no value "pressed"; expected one of: …`, followed by all state names.


## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Tap me', { forState: ['normal'] });
button.setTitle('Let go!', { forState: ['highlighted'] });
```

**Effect**: It normally shows "Tap me"; while a finger presses it, it shows "Let go!"; on release it goes back to "Tap me".

## Corresponding iOS API

`-[UIButton setTitle:forState:]`. In ObjC the state is the bitmask `UIControlStateSelected | UIControlStateDisabled`; here it is the array `['selected', 'disabled']`.

## See also

- [`titleForState()`](titleforstate.md): reading the title for a state
- [`setAttributedTitle()`](setattributedtitle.md): a title that mixes several fonts and colors
- [States](../ui-button.md#states)
