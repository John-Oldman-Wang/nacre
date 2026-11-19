---
type: reference
native: "-[UIColorWell init]"
---

# `UIColorWell()` constructor

The **`UIColorWell()`** constructor creates a color well.

## Syntax

```
new UIColorWell()
```

### Parameters

None.

### Return value

A new `UIColorWell` with the following property values (measured in the simulator):

| Property | Value |
| --- | --- |
| [`title`](title.md) | `null` |
| [`selectedColor`](selectedcolor.md) | `null` |
| [`supportsAlpha`](supportsalpha.md) | `true` |
| [`supportsEyedropper`](supportseyedropper.md) | `true` |
| [`maximumLinearExposure`](maximumlinearexposure.md) | `0` |

It's an instance of [`UIControl`](../ui-control.md) and [`UIView`](../ui-view.md). Give it a position and size before adding it to a view controller.

### Exceptions

**`TypeError`**

Subclassing it and calling `new`: `class X extends UIColorWell {}` throws on `new X()`. See [Native classes](../native-classes.md).

## Examples

```js
const well = new UIColorWell();
console.log(well instanceof UIControl, well.selectedColor);
```

**Result**: prints `true null`.

## Corresponding iOS API

`-[UIColorWell init]`.

## See also

- [`selectedColor`](selectedcolor.md)
