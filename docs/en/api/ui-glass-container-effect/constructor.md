---
type: reference
native: "-[UIGlassContainerEffect init]"
---

# `UIGlassContainerEffect()` constructor

The **`UIGlassContainerEffect()`** constructor creates a glass container effect. Give it to an effect view, then put several pieces of glass into that effect view's `contentView`, and those pieces are drawn as a group.

## Syntax

```
new UIGlassContainerEffect()
```

### Parameters

None.

### Return value

A new `UIGlassContainerEffect`. [`spacing`](spacing.md) is 0.

### Exceptions

None.

## Examples

```js
const group = new UIGlassContainerEffect();
const groupView = new UIVisualEffectView(group);
groupView.frame = new CGRect(40, 420, 300, 60);
```

**Effect**: gives a 300 × 60 pt effect view. Glass effect views placed in its `contentView` are drawn as a group. **Not verified in the simulator.**

## Corresponding iOS API

`[[UIGlassContainerEffect alloc] init]`.

## See also

- [`spacing`](spacing.md)
- [Making blur and glass effects](../../guides/blur-and-glass.md#combining-several-pieces-of-glass-into-a-group)
