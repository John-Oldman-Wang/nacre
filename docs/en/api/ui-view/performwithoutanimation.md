---
type: reference
native: "+[UIView performWithoutAnimation:]"
---

# `UIView.performWithoutAnimation()` static method

The **`UIView.performWithoutAnimation()`** static method runs a block of code in which view changes aren't animated, even when it is called inside the `animations` of [`animateWithDuration()`](animatewithduration.md).

## Syntax

```
UIView.performWithoutAnimation(actions)
```

### Parameters

**`actions`**

A function with no parameters. It runs synchronously during this call and has finished when the call returns.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`actions` isn't a function: `UIView.performWithoutAnimation: actions must be a function`.

Exceptions thrown inside `actions` propagate to the caller unchanged.

## Examples

```js
const dot = new UIView();
const badge = new UIView();

UIView.animateWithDuration(0.3, {
  animations() {
    dot.alpha = 0.5;
    UIView.performWithoutAnimation(() => {
      badge.alpha = 0;
    });
  },
});
```

**Effect**: `dot` becomes semi-transparent over 0.3 seconds, while `badge` becomes fully transparent immediately, with no fade. Verified by testing: the property changed inside `performWithoutAnimation()` takes effect, and no extra animation is added to the layer.

## Corresponding iOS API

`+[UIView performWithoutAnimation:]`.

## See also

- [`animateWithDuration()`](animatewithduration.md)
