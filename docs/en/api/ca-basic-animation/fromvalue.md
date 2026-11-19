---
type: reference
native: CABasicAnimation.fromValue
---

# `CABasicAnimation`: `fromValue` property

The **`fromValue`** property is the start value of the animation.

## Value

The type depends on [`keyPath`](../ca-property-animation/keypath.md); see [Animatable properties](../ca-property-animation.md#animatable-properties). Or `null`.

- Readable and writable.
- Defaults to `null`.
- When it is not given, the animation starts from the property's value. **Not verified in the simulator.**
- Values read back: numbers are numbers; `CGPoint`, `CGSize`, and `CGRect` are the corresponding structs; colors are strings; paths and images are objects.
- Colors read back as strings. A color that varies with light and dark mode (such as `'systemBlue'`) reads back as the resolved fixed color, by the same rules as [Colors on layers](../ca-layer.md#colors-on-layers).
- Numbers must be written as numbers. Strings are always treated as colors; `'0.5'` is not treated as 0.5.
- Writing `null` or `undefined` clears the value.

### Invalid values

An invalid color does not throw: the console logs a warning and the previous value is kept.

Other cases throw `TypeError`:

- No `keyPath` yet: `set keyPath before fromValue; the value's type depends on it`
- The type does not match `keyPath`: `fromValue does not fit keyPath "position"`
- `keyPath` needs a color and the value is not one: `fromValue for keyPath "strokeColor" needs a color`
- `keyPath` needs a path and the value is not one: `fromValue for keyPath "path" needs a UIBezierPath`
- `keyPath` needs an image and the value is not one: `fromValue for keyPath "contents" needs a UIImage`
- The value is none of a number, struct, color, path, or image: `fromValue needs a number, a CGPoint / CGSize / CGRect, a color, a UIBezierPath, or a UIImage`

## Examples

```js
const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = new CGPoint(30, 80);
move.toValue = new CGPoint(270, 80);
move.duration = 0.6;
console.log(String(move.fromValue));
```

**Effect**: once added to a layer, the layer's center moves from (30, 80) to (270, 80) over 0.6 seconds. The console logs `CGPoint(30, 80)`.

## Corresponding iOS API

`CABasicAnimation.fromValue`. Values that ObjC wraps as `NSNumber`, `NSValue`, `CGColorRef`, or `CGPathRef` are written here directly as numbers, structs, color strings, and `UIBezierPath`.

## See also

- [`toValue`](tovalue.md): end value
- [`byValue`](byvalue.md): amount of change
