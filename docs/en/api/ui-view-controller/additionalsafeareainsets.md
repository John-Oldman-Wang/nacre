---
type: reference
native: UIViewController.additionalSafeAreaInsets
---

# `UIViewController`: `additionalSafeAreaInsets` property

The **`additionalSafeAreaInsets`** property is the extra insets this view controller adds on top of the system's safe area. The "safe area" is the region of the screen not covered by the notch, the status bar, or the home indicator at the bottom. When a parent view controller covers part of a child with something (such as a custom row of tab buttons), it uses this property to tell the child not to put content in that strip.

## Value

A [`UIEdgeInsets`](../structs.md); all four edges are in [pt](../units.md).

- Readable and writable.
- The default is 0 on all four edges.
- After writing, this view controller's `view.safeAreaInsets` and `safeAreaLayoutGuide` change accordingly.
- Before the view controller is shown on screen, `view.safeAreaInsets` reads 0 on all four edges, even after writing this property. It is correct only after the view controller is shown and laid out once (verified by testing). Content constrained to `safeAreaLayoutGuide` is not affected; it moves into place automatically during layout.
- No event fires when it changes: only the app's own code can change it.

### Invalid values

- Not an object: throws `TypeError: additionalSafeAreaInsets needs an object with all of: top, left, bottom, right`.
- A field is missing or cannot be converted to a finite number: throws `TypeError: additionalSafeAreaInsets is missing bottom, or it is not a finite number`.

## Examples

```js
const panel = new UIViewController();
panel.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, 44, 0);

const label = new UILabel();
label.text = 'Against the bottom of the safe area';
label.translatesAutoresizingMaskIntoConstraints = false;
panel.view.addSubview(label);
const safe = panel.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  label.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
  label.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor, { constant: -8 }),
]);
```

**Effect**: Once `panel` is shown, the bottom of its safe area is 44 pt above the bottom of its view. The bottom of the line of text is 52 pt from the bottom of `panel`'s view (44 plus the 8 in the constraint), and the empty 44 pt below is left for the parent to cover.

## Corresponding iOS API

`UIViewController.additionalSafeAreaInsets`. `UIEdgeInsetsMake(0, 0, 44, 0)` is written `new UIEdgeInsets(0, 0, 44, 0)`.

## See also

- [Structs](../structs.md): `UIEdgeInsets`
- [Auto Layout](../auto-layout.md): `safeAreaLayoutGuide`
