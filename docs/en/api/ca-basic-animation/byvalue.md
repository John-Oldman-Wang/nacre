---
type: reference
native: CABasicAnimation.byValue
---

# `CABasicAnimation`: `byValue` property

The **`byValue`** property is the amount by which the animation changes the property.

## Value

The type depends on [`keyPath`](../ca-property-animation/keypath.md); see [Animatable properties](../ca-property-animation.md#animatable-properties). Or `null`.

- Readable and writable.
- Defaults to `null`.
- When only `fromValue` and `byValue` are given, the end value is their sum. When only `byValue` is given, the animation goes from the property's value to the property's value plus `byValue`. **Not verified in the simulator.**
- Values read back: numbers are numbers; `CGPoint`, `CGSize`, and `CGRect` are the corresponding structs; colors are strings; paths and images are objects.
- Colors read back as strings. A color that varies with light and dark mode (such as `'systemBlue'`) reads back as the resolved fixed color, by the same rules as [Colors on layers](../ca-layer.md#colors-on-layers).
- Numbers must be written as numbers. Strings are always treated as colors; `'0.5'` is not treated as 0.5.
- Writing `null` or `undefined` clears the value.

### Invalid values

An invalid color does not throw: the console logs a warning and the previous value is kept.

Other cases throw `TypeError`:

- No `keyPath` yet: `set keyPath before byValue; the value's type depends on it`
- The type does not match `keyPath`: `byValue does not fit keyPath "position"`
- `keyPath` needs a color and the value is not one: `byValue for keyPath "strokeColor" needs a color`
- `keyPath` needs a path and the value is not one: `byValue for keyPath "path" needs a UIBezierPath`
- `keyPath` needs an image and the value is not one: `byValue for keyPath "contents" needs a UIImage`
- The value is none of a number, struct, color, path, or image: `byValue needs a number, a CGPoint / CGSize / CGRect, a color, a UIBezierPath, or a UIImage`

## Examples

```js
const grow = CABasicAnimation.animationWithKeyPath('cornerRadius');
grow.fromValue = 0;
grow.byValue = 10;
grow.duration = 0.4;
console.log(grow.byValue);
```

**Effect**: once added to a layer, the corner radius goes from 0 to 10 pt over 0.4 seconds. The console logs `10`. **What appears on screen is not verified in the simulator.**

## Corresponding iOS API

`CABasicAnimation.byValue`. Values that ObjC wraps as `NSNumber`, `NSValue`, `CGColorRef`, or `CGPathRef` are written here directly as numbers, structs, color strings, and `UIBezierPath`.

## See also

- [`fromValue`](fromvalue.md): start value
- [`toValue`](tovalue.md): end value
