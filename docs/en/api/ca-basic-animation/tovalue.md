---
type: reference
native: CABasicAnimation.toValue
---

# `CABasicAnimation`: `toValue` property

The **`toValue`** property is the end value of the animation.

## Value

The type depends on [`keyPath`](../ca-property-animation/keypath.md); see [Animatable properties](../ca-property-animation.md#animatable-properties). Or `null`.

- Readable and writable.
- Defaults to `null`.
- When it is not given, the animation ends at the property's value; when only `fromValue` and `byValue` are given, the end value is their sum. **Not verified in the simulator.**
- Values read back: numbers are numbers; `CGPoint`, `CGSize`, and `CGRect` are the corresponding structs; colors are strings; paths and images are objects.
- Colors read back as strings. A color that varies with light and dark mode (such as `'systemBlue'`) reads back as the resolved fixed color, by the same rules as [Colors on layers](../ca-layer.md#colors-on-layers).
- Numbers must be written as numbers. Strings are always treated as colors; `'0.5'` is not treated as 0.5.
- Writing `null` or `undefined` clears the value.

### Invalid values

An invalid color does not throw: the console logs a warning and the previous value is kept.

Other cases throw `TypeError`:

- No `keyPath` yet: `set keyPath before toValue; the value's type depends on it`
- The type does not match `keyPath`: `toValue does not fit keyPath "position"`
- `keyPath` needs a color and the value is not one: `toValue for keyPath "strokeColor" needs a color`
- `keyPath` needs a path and the value is not one: `toValue for keyPath "path" needs a UIBezierPath`
- `keyPath` needs an image and the value is not one: `toValue for keyPath "contents" needs a UIImage`
- The value is none of a number, struct, color, path, or image: `toValue needs a number, a CGPoint / CGSize / CGRect, a color, a UIBezierPath, or a UIImage`

## Examples

```js
const stroke = CABasicAnimation.animationWithKeyPath('strokeColor');
stroke.fromValue = 'systemBlue';
stroke.toValue = '#FF2D55';
stroke.duration = 1;
console.log(stroke.toValue);
```

**Effect**: once added to a shape layer, the stroke color fades from blue to pink over 1 second (**what appears on screen is not verified in the simulator**). The console logs `#FF2D55`: a color written in hex reads back unchanged.

## Corresponding iOS API

`CABasicAnimation.toValue`. Values that ObjC wraps as `NSNumber`, `NSValue`, `CGColorRef`, or `CGPathRef` are written here directly as numbers, structs, color strings, and `UIBezierPath`.

## See also

- [`fromValue`](fromvalue.md): start value
- [`byValue`](byvalue.md): amount of change
- [Colors](../ui-color.md): how to write color values
