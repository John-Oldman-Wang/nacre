---
type: reference
native: CAKeyframeAnimation.values
---

# `CAKeyframeAnimation`: `values` property

The **`values`** property is the values the animation passes through in turn, that is, the keyframes.

## Value

An array whose items' type is determined by [`keyPath`](../ca-property-animation/keypath.md), by the same rules as [`CABasicAnimation.toValue`](../ca-basic-animation/tovalue.md); or `null`.

- Readable and writable.
- The default is `null`.
- After [`path`](path.md) is set, `values` has no effect.
- The time at which each value occurs is decided by [`keyTimes`](keytimes.md); when not set, they are evenly spaced.
- Between adjacent values the change is continuous by default; how it transitions is decided by [`calculationMode`](calculationmode.md).
- All items must be of the same type. The kind of the whole array is judged from the first item.
- For colors, the values read back are strings; colors that change with light and dark mode read back as the resolved fixed color, not necessarily the string written.
- For images, each item read back is a new `UIImage` object, not the one written, and its `scale` is 1. For frame-by-frame animation from a set of images, see [Controlling animated image playback yourself](../../guides/images.md#controlling-animated-image-playback-yourself).
- Writing `null` or `undefined` clears it.

### Invalid values

- An item is an invalid color: does not throw; the console prints a warning, and the whole assignment has no effect.
- There is no `keyPath` yet: throws `TypeError: set keyPath before values; the value's type depends on it`.
- The type of a value does not match `keyPath`: throws `TypeError`. For mismatched colors, paths, and images, it is `values does not fit this keyPath`.

## Examples

```js
const flash = CAKeyframeAnimation.animationWithKeyPath('fillColor');
flash.values = ['systemRed', '#FFCC00', 'systemGreen'];
console.log((flash.values || []).length);

const move = CAKeyframeAnimation.animationWithKeyPath('position');
move.values = [new CGPoint(0, 0), new CGPoint(10, 20), new CGPoint(30, 5)];
console.log(String((move.values || [])[1]));
```

**Result**: Prints `3` first, then `CGPoint(10, 20)`.

## Corresponding iOS API

`CAKeyframeAnimation.values`. Items that must be wrapped in ObjC as `NSNumber`, `NSValue`, or `CGColorRef` are written here directly as numbers, structs, and color strings.

## See also

- [`keyTimes`](keytimes.md)
- [Passing through several values](../../guides/animation.md#passing-through-several-values-in-turn)
