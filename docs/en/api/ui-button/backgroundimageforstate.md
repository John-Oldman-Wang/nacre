---
type: reference
native: "-[UIButton backgroundImageForState:]"
---

# `UIButton`: `backgroundImageForState()` method

The **`backgroundImageForState()`** method returns the background image the button uses in a given state.

## Syntax

```
backgroundImageForState(state)
```

### Parameters

**`state`**

One state name, a string: one of `'normal'`, `'highlighted'`, `'disabled'`, `'selected'`, `'focused'`.

Unlike the setter methods, only one state name can be passed here, not an array.

### Return value

[`UIImage`](../ui-image.md), or `null`. It returns the same object that was set.

When this state hasn't been set separately, it returns the one for the `normal` state. When `normal` hasn't been set either, it returns `null`.

### Exceptions

**`TypeError`**

`state` is not one of the state names above.

## Examples

```js
const button = new UIButton();
console.log(button.backgroundImageForState('normal'));
```

**Result**: Prints `null`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIButton backgroundImageForState:]`.

## See also

- [`setBackgroundImage()`](setbackgroundimage.md)
- [`current…` properties](../ui-button.md#instance-properties): reading the one the button is displaying right now
