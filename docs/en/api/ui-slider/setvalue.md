---
type: reference
native: "-[UISlider setValue:animated:]"
---

# `UISlider`: `setValue()` method

The **`setValue()`** method changes the slider's value, optionally with animation.

## Syntax

```
setValue(value[, { animated }])
```

### Parameters

**`value`**

The new value, a number. Converted with `Number()`. A value outside [`minimumValue`](minimumvalue.md) to [`maximumValue`](maximumvalue.md) is clamped to the nearer end, the same as writing [`value`](value.md).

**`options.animated`**

Optional, a boolean. When `true`, the thumb slides over; when omitted, `undefined`, or `false`, it jumps into place. The whole `options` can be omitted.

### Return value

None (`undefined`).

The value has already changed when the call returns; you don't need to wait for the animation to finish (measured).

### Exceptions

**`TypeError`**

`value` can't be converted to a finite number: `setValue must be a finite number, got "max"`.

## Description

Like writing `value`, `setValue()` doesn't fire [`change`](../ui-control/change-event.md). The acceptance tests assert that no `change` is received after the call.

## Examples

```js
const slider = new UISlider();
slider.maximumValue = 100;
slider.setValue(80, { animated: true });
console.log(slider.value);
```

**Effect**

- The thumb slides to the 80 position. **The animation is not verified in the simulator.**
- The console immediately prints `80`.

## Corresponding iOS API

`-[UISlider setValue:animated:]`. `animated` is required in ObjC; here it can be omitted, and omitting it means `NO`.

## See also

- [`value`](value.md)
