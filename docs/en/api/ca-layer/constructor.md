---
type: reference
native: "-[CALayer init]"
---

# `CALayer()` constructor

The **`CALayer()`** constructor creates a layer.

Every view has a layer created by the system; read it with `view.layer`, without `new`. Only for content the view has no property for, such as gradients and shapes, do you create a layer with `new` and add it under some view's layer.

## Syntax

```
new CALayer()
```

### Parameters

None.

### Return value

A new `CALayer`: [`frame`](frame.md) is `(0, 0, 0, 0)`, with no superlayer and no sublayers.

It becomes visible only after you set `frame` and add it under a layer already on screen. Once added under a superlayer, the superlayer keeps it; you don't need to store it separately in your code.

### Exceptions

**`TypeError`**

It can't be subclassed: `class X extends CALayer {}` throws at `new X()`; see [Native classes](../native-classes.md).

## Examples

```js
const card = new UIView();
const badge = new CALayer();
badge.frame = new CGRect(20, 20, 40, 40);
badge.backgroundColor = 'systemRed';
card.layer.addSublayer(badge);
console.log(badge.superlayer === card.layer);
```

**Result**: The console prints `true`. A 40 × 40 pt red square appears at the top left of the card.

## Corresponding iOS API

`[CALayer layer]`, `[[CALayer alloc] init]`.

## See also

- [Where layers come from](../ca-layer.md#where-layers-come-from)
- [`addSublayer()`](addsublayer.md)
