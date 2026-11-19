---
type: reference
native: "-[UISwitch init]"
---

# `UISwitch()` constructor

The **`UISwitch()`** constructor creates a switch. A new switch is off.

## Syntax

```
new UISwitch()
```

### Parameters

None.

### Return value

A new `UISwitch`.

- [`isOn`](ison.md) is `false`.
- [`onTintColor`](ontintcolor.md) and [`thumbTintColor`](thumbtintcolor.md) are `null`, using the system colors.
- The inherited `isEnabled` is `true`, and `state` is `['normal']`.

The switch's size is decided by the system: when writing `frame`, the width and height have no effect (measured), but the position does. Measured at 63 × 28 [pt](../units.md) on iOS 27.2. With Auto Layout, give only position constraints, not width or height constraints.

### Exceptions

None.

Can't be subclassed: `class MySwitch extends UISwitch {}` throws `TypeError` on `new MySwitch()`; see [native classes](../native-classes.md).

## Examples

```js
const sw = new UISwitch();
console.log(sw.isOn);
sw.frame = new CGRect(0, 0, 200, 100);
console.log(sw.frame.width);
```

**Result**

- First prints `false`.
- Then prints the switch's original width, not 200.

## Corresponding iOS API

`[[UISwitch alloc] init]`.

## See also

- [`isOn`](ison.md)
