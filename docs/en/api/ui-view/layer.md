---
type: reference
native: UIView.layer
---

# `UIView`: `layer` property

The **`layer`** property is the view's layer: the object behind the view that does the drawing. Corner radius, borders, and shadows are set on it.

## Value

[`CALayer`](../ca-layer.md).

- Read-only; assigning to it throws `TypeError`.
- Each view has one layer; reading it repeatedly returns the same object.

## Examples

```js
const card = new UIView();
card.layer.cornerRadius = 12;
console.log(card.layer === card.layer);
```

**Effect**: The view's four corners become rounded with a radius of 12 pt. Logs `true`.

## Corresponding iOS API

`UIView.layer`.

## See also

- [`CALayer`](../ca-layer.md): corner radius, borders, shadows, gradients
- [`clipsToBounds`](clipstobounds.md)
