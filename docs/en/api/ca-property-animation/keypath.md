---
type: reference
native: CAPropertyAnimation.keyPath
---

# `CAPropertyAnimation`: `keyPath` property

The **`keyPath`** property specifies which property of the layer the animation changes. It also determines what type the from value, to value, and keyframe values must have.

## Value

A string, one of the names in the [animatable properties](../ca-property-animation.md#animatable-properties) table; or `null`.

- Readable and writable.
- When created with `animationWithKeyPath()`, it is the name given at creation. When created with `new`, it is `null`.
- While it is `null`, `fromValue`, `toValue`, `byValue`, and `values` cannot be set; setting them throws `TypeError`.

### Invalid values

Writing a name that is not in the table does not throw. The console prints a warning listing every accepted name, and `keyPath` keeps its previous value:

```
[Nacre] keyPath has no value "frame"; expected one of: backgroundColor / borderColor / …, ignored
```

An invalid argument to `animationWithKeyPath()` throws; see [`CABasicAnimation.animationWithKeyPath()`](../ca-basic-animation/animationwithkeypath.md).

## Examples

```js
const fade = new CABasicAnimation();
console.log(fade.keyPath);
fade.keyPath = 'opacity';
fade.fromValue = 1;
fade.toValue = 0;
console.log(fade.keyPath);
```

**Result**: prints `null`, then `opacity`.

## Corresponding iOS API

`CAPropertyAnimation.keyPath`. Only the names in the table are accepted, not arbitrary key paths.

## See also

- [Animatable properties](../ca-property-animation.md#animatable-properties)
- [Enums](../enums.md): why an invalid property value produces a warning rather than an exception
