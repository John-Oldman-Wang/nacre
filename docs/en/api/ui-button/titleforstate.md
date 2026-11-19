---
type: reference
native: "-[UIButton titleForState:]"
---

# `UIButton`: `titleForState()` method

The **`titleForState()`** method returns the title the button uses in a given state.

## Syntax

```
titleForState(state)
```

### Parameters

**`state`**

One state name, a string: one of `'normal'`, `'highlighted'`, `'disabled'`, `'selected'`, `'focused'`.

Unlike the setter methods, only one state name can be passed here, not an array.

### Return value

A string, or `null`.

When this state hasn't been set separately, it returns the one for the `normal` state. When `normal` hasn't been set either, it returns `null`.

### Exceptions

**`TypeError`**

`state` is not one of the state names above.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Tap me', { forState: ['normal'] });
button.setTitle('Let go!', { forState: ['highlighted'] });

console.log(button.titleForState('normal'));
console.log(button.titleForState('highlighted'));
console.log(button.titleForState('disabled'));
```

**Result**: Prints `Tap me`, `Let go!`, `Tap me` in order. `disabled` hasn't been set separately, so it returns the `normal` one.

## Corresponding iOS API

`-[UIButton titleForState:]`.

## See also

- [`setTitle()`](settitle.md)
- [`current…` properties](../ui-button.md#instance-properties): reading the one the button is displaying right now
