---
type: reference
native: "-[UIButton setAttributedTitle:forState:]"
---

# `UIButton`: `setAttributedTitle()` method

The **`setAttributedTitle()`** method sets a styled title for one or more of the button's states. The button displays the one for its current state.

## Syntax

```
setAttributedTitle(value, { forState })
```

### Parameters

**`value`**

An [`NSAttributedString`](../ns-attributed-string.md). States that have it set no longer show the title from [`setTitle()`](settitle.md), and the color from [`setTitleColor()`](settitlecolor.md) has no effect in those states either. Passing `null` removes the setting for these states, and they go back to using the `normal` one.

**`options.forState`**

An array of state names, required. Which states to set; see [States](../ui-button.md#states). When you set only `['normal']`, every state that hasn't been set separately uses it. For a value used only when several states hold at once, put all of those state names in the array, for example `['selected', 'disabled']`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forState` not passed: `setAttributedTitle needs { forState }`.
- `forState` contains an unrecognized state name: `forState has no value "pressed"; expected one of: …`, followed by all state names.
- `value` is neither an `NSAttributedString` nor `null` (for example, a string was passed).


## Examples

```js
const button = UIButton.buttonWithType('system');
const bold = UIFont.boldSystemFontOfSize(20);
button.setAttributedTitle(new NSAttributedString('Submit', { font: bold, foregroundColor: 'systemBlue' }),
                          { forState: ['normal'] });
button.setAttributedTitle(new NSAttributedString('Submit', { font: bold, foregroundColor: 'systemGray' }),
                          { forState: ['highlighted'] });
```

**Effect**: It normally shows a 20 pt bold blue "Submit", which turns gray while a finger presses it. How it looks on screen is **not verified in the simulator**.

## Corresponding iOS API

`-[UIButton setAttributedTitle:forState:]`. In ObjC the state is the bitmask `UIControlStateSelected | UIControlStateDisabled`; here it is the array `['selected', 'disabled']`.

## See also

- [`attributedTitleForState()`](attributedtitleforstate.md)
- [Attributed strings](../ns-attributed-string.md)
- [States](../ui-button.md#states)
