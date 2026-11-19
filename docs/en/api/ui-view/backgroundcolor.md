---
type: reference
native: UIView.backgroundColor
---

# `UIView`: `backgroundColor` property

The **`backgroundColor`** property is the view's background color.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- The default is `null`, meaning transparent. A transparent view has a size and can contain subviews, but draws nothing itself.
- On write it accepts color strings (`'systemIndigo'`, `'#FF3B30'`, `'rgba(88, 86, 214, 0.5)'`) and also `UIColor` objects.
- It reads back as a string: a valid string reads back unchanged; a `UIColor` object reads back as that color's name.
- Animatable. See [`UIView.animateWithDuration()`](animatewithduration.md).
- [`UIStackView`](../ui-stack-view.md) doesn't draw itself, so a background color set on it isn't visible.

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning such as `[Nacre] backgroundColor: "#GGG" is not a valid color, ignored`, and the color keeps its previous value.

## Examples

```js
const card = new UIView();
card.backgroundColor = 'systemIndigo';
console.log(card.backgroundColor);
card.backgroundColor = '#GGG';
console.log(card.backgroundColor);
```

**Result**: Prints `systemIndigo`, then `systemIndigo`. The second write is invalid, so the console also shows a warning, and the color doesn't change.

## Corresponding iOS API

`UIView.backgroundColor`. `UIColor.systemIndigoColor` is written as `'systemIndigo'`.

## See also

- [Colors](../ui-color.md): which values you can write
- [`alpha`](alpha.md)
