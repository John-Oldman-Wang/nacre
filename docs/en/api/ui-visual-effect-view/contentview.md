---
type: reference
native: UIVisualEffectView.contentView
---

# `UIVisualEffectView`: `contentView` property

The **`contentView`** property is the view inside an effect view that holds its content. Text, icons, and buttons to display on the effect view are all added to it, not to the effect view itself.

## Value

A [`UIView`](../ui-view.md).

- Read-only. Assigning to it throws `TypeError`.
- The effect view comes with it, and it is always the same size as the effect view.
- It's always the same object: changing or clearing the effect leaves `contentView` and its content unchanged.

### Adding directly to the effect view is rejected

Calling `addSubview()` or `insertSubview()` on the effect view itself throws `TypeError`:

```
addSubview: a UIVisualEffectView takes no subviews of its own; add them to its contentView
```

The rejected view doesn't enter any view hierarchy.

Reading the effect view's `subviews` returns the views it uses internally, including `contentView`. Their number varies with the effect; don't rely on it, and don't move or remove these views.

## Examples

```js
const panel = new UIVisualEffectView(UIBlurEffect.effectWithStyle('systemMaterial'));
panel.frame = new CGRect(60, 260, 240, 80);

const label = new UILabel();
label.text = 'Frosted glass';
label.frame = new CGRect(0, 0, 240, 80);
panel.contentView.addSubview(label);
```

**Effect**: The panel shows the words "Frosted glass", and the text itself is sharp. **Not verified in the simulator.**

## Corresponding iOS API

`UIVisualEffectView.contentView`. `[view.contentView addSubview:label]` is written as `view.contentView.addSubview(label)`.

## See also

- [Creating blur and glass effects](../../guides/blur-and-glass.md)
