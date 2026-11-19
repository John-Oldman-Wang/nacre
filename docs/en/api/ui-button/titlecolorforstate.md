---
type: reference
native: "-[UIButton titleColorForState:]"
---

# `UIButton`: `titleColorForState()` method

The **`titleColorForState()`** method returns the title color the button uses in a given state.

## Syntax

```
titleColorForState(state)
```

### Parameters

**`state`**

One state name, a string: one of `'normal'`, `'highlighted'`, `'disabled'`, `'selected'`, `'focused'`.

Unlike the setter methods, only one state name can be passed here, not an array.

### Return value

A [color](../ui-color.md) string, or `null`. If it was set with a color string, that string is returned as is; if it was set with one of `UIColor`'s system color constants, its name is returned (for example `'systemRed'`).

When this state hasn't been set separately, it returns the one for the `normal` state. When `normal` hasn't been set either, it returns `null`.

### Exceptions

**`TypeError`**

`state` is not one of the state names above.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitleColor(UIColor.systemRedColor, { forState: ['normal'] });
console.log(button.titleColorForState('normal'));
```

**Result**: Prints `systemRed`.

## Corresponding iOS API

`-[UIButton titleColorForState:]`.

## See also

- [`setTitleColor()`](settitlecolor.md)
- [`current…` properties](../ui-button.md#instance-properties): reading the one the button is displaying right now
