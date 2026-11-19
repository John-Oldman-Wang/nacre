---
type: reference
native: "-[UISwitch setOn:animated:]"
---

# `UISwitch`: `setOn()` method

The **`setOn()`** method toggles the switch to the given side, optionally animated.

## Syntax

```
setOn(on[, { animated }])
```

### Parameters

**`on`**

`true` is on, `false` is off. Converted by JS truthiness, the same as writing [`isOn`](ison.md).

**`options.animated`**

Optional, a boolean. When `true`, the thumb slides over; when omitted, `undefined`, or `false`, there is no animation and it moves into place directly. The whole `options` can be omitted.

### Return value

None (`undefined`).

The value has already changed when the call returns, without waiting for the animation to finish (measured).

### Exceptions

None.

## Description

Like writing `isOn`, `setOn()` doesn't fire [`change`](../ui-control/change-event.md). So calling it in a `change` callback to switch it back doesn't trigger the callback again. Asserted in the acceptance tests: no `change` arrived after the call.

## Examples

```js
const sw = new UISwitch();
sw.setOn(true, { animated: true });
console.log(sw.isOn);
```

**Effect**

- The thumb slides to the right. **The animation is not verified in the simulator.**
- The console immediately prints `true`.

## Corresponding iOS API

`-[UISwitch setOn:animated:]`. `animated` is required in ObjC; here it can be omitted, which means `NO`.

## See also

- [`isOn`](ison.md)
- [Reverting when saving fails](../../guides/switches-sliders-steppers.md#revert-the-switch-when-saving-fails)
