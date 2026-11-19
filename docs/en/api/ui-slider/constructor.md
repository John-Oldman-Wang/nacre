---
type: reference
native: "-[UISlider init]"
---

# `UISlider()` constructor

The **`UISlider()`** constructor creates a slider.

## Syntax

```
new UISlider()
```

### Parameters

None.

### Return value

A new `UISlider`. Its properties have their default values:

| Property | Default |
| --- | --- |
| [`value`](value.md) | 0 |
| [`minimumValue`](minimumvalue.md) | 0 |
| [`maximumValue`](maximumvalue.md) | 1 |
| [`isContinuous`](iscontinuous.md) | `true` |
| [`sliderStyle`](sliderstyle.md) | `'default'` |
| The three color properties | `null` |
| The two end images and the three per-state images | `null` |

A new slider is 0 wide and not visible on screen. Its height is determined by the system; measured on iOS 27.2 it is 34 [pt](../units.md). When you add it to a page, give it a width: write `frame`, add a width constraint, or put it in a vertical [`UIStackView`](../ui-stack-view.md) that stretches it.

### Exceptions

None.

It can't be subclassed: `class MySlider extends UISlider {}` throws `TypeError` at `new MySlider()`; see [Native classes](../native-classes.md).

## Examples

```js
const slider = new UISlider();
slider.frame = new CGRect(16, 100, 300, 34);
console.log(slider.value, slider.minimumValue, slider.maximumValue);
```

**Result**

- Prints `0 0 1`.
- You get a slider 300 pt wide with the thumb at the far left. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`[[UISlider alloc] init]`.

## See also

- [`value`](value.md)
