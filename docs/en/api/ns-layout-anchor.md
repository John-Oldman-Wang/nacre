---
type: reference
native: NSLayoutAnchor
---

# `NSLayoutAnchor`

**`NSLayoutAnchor`** represents a position or size on a view that constraints can refer to, called an anchor: an edge, a center line, a text baseline, a width, or a height. Constraints ([`NSLayoutConstraint`](auto-layout.md)) are created from anchors and express a relationship between two anchors.

`NSLayoutAnchor` is the base class of three anchor classes and never appears on its own. The anchors you actually get are [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md) (horizontal position), [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md) (vertical position), or [`NSLayoutDimension`](ns-layout-dimension.md) (size). All three classes have the three methods on this page. Anchors have no properties.

**Inheritance**: `EventTarget` → `NSObject` → `NSLayoutAnchor`

For how to build constraints from anchors, see the guide [Laying out with constraints](../guides/auto-layout.md).

## Constructor

It cannot be created with `new`. Anchors are read from properties of a view or a [`UILayoutGuide`](ui-layout-guide.md), such as [`view.leadingAnchor`](ui-view/leadinganchor.md). `new` throws `TypeError: Illegal constructor: NSLayoutAnchor is created by the runtime, not by new`, with the actual class name. Anchor classes cannot be subclassed either.

## Instance methods

The three methods correspond to three relations, and all **return a new `NSLayoutConstraint` that is not yet active**:

| Method | Resulting constraint |
| --- | --- |
| [`constraintEqualToAnchor()`](ns-layout-anchor/constraintequaltoanchor.md) | this anchor = `other` + `constant` |
| [`constraintGreaterThanOrEqualToAnchor()`](ns-layout-anchor/constraintgreaterthanorequaltoanchor.md) | this anchor ≥ `other` + `constant` |
| [`constraintLessThanOrEqualToAnchor()`](ns-layout-anchor/constraintlessthanorequaltoanchor.md) | this anchor ≤ `other` + `constant` |

## Events

Anchors fire no events.

## Concepts

An anchor is a position or size on a view that constraints can refer to. Each anchor is a read-only property of the view:

```
                 centerXAnchor
                       ┆
           ┌───────────┆───────────┐ ← topAnchor
           │           ┆           │
           │   first line ┄┄┄┄┄┄┄┄┄│ ← firstBaselineAnchor
centerY ┄┄┄│┄┄┄┄┄┄┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┄│
Anchor     │   last line ┄┄┄┄┄┄┄┄┄┄│ ← lastBaselineAnchor
           │           ┆           │
           └───────────┆───────────┘ ← bottomAnchor
           ↑                       ↑
     leadingAnchor           trailingAnchor
     (leftAnchor)            (rightAnchor)

           ├────── widthAnchor ────┤     heightAnchor is the distance from top to bottom
```

Anchors come in three types, corresponding to three classes:

| Class | Anchors it includes | What it can be constrained to |
| --- | --- | --- |
| [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md) (horizontal position) | `leadingAnchor`, `trailingAnchor`, `leftAnchor`, `rightAnchor`, `centerXAnchor` | Another horizontal position |
| [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md) (vertical position) | `topAnchor`, `bottomAnchor`, `centerYAnchor`, `firstBaselineAnchor`, `lastBaselineAnchor` | Another vertical position |
| [`NSLayoutDimension`](ns-layout-dimension.md) (size) | `widthAnchor`, `heightAnchor` | Another size, or a constant |

### No constraints across the three types

A top edge cannot be aligned with a left edge, and a width cannot equal a top edge. But width and height are the same type and can constrain each other; that is how [Keeping an aspect ratio](../guides/auto-layout.md#keeping-an-aspect-ratio) is written.

When the types do not match, TypeScript reports an error in the editor. At run time it throws `TypeError`:

```js
const card = new UIView();
try {
  // @ts-expect-error a vertical position cannot be constrained to a horizontal position
  card.topAnchor.constraintEqualToAnchor(card.leadingAnchor);
} catch (err) {
  console.log(String(err));
}
```

**Effect**: the console logs `TypeError: NSLayoutYAxisAnchor cannot be constrained to NSLayoutXAxisAnchor: their units are not compatible`.

### `leading` / `trailing` and `left` / `right`

`leading` is the side where text starts, and `trailing` is the side where it ends. In left-to-right languages such as English and Chinese, `leading` is left and `trailing` is right. When the system language is a right-to-left language such as Arabic or Hebrew, the two swap and the whole interface is mirrored horizontally. `left` and `right` are always the left and right of the screen.

Use `leading` / `trailing` normally, so the interface mirrors automatically in right-to-left languages. Use `left` / `right` only when the content really has nothing to do with writing direction. The swap in right-to-left languages is **not verified in the simulator**.

Do not mix `leading` / `trailing` with `left` / `right` in the same constraint.

### Baselines

The **baseline** is the line that the bottoms of letters in a line of text sit on. `firstBaselineAnchor` is the baseline of the first line of text, and `lastBaselineAnchor` that of the last line. When two labels with different font sizes sit side by side, aligning their baselines puts the bottoms of both texts on the same line; aligning their top or bottom edges does not.

### Where anchors come from

Anchors cannot be constructed yourself; they can only be read from a view or a `UILayoutGuide`. The same anchor of the same view is the same object on every read: `card.topAnchor === card.topAnchor` is `true`.

### Keeping just the anchor or the constraint is enough

If your code keeps only an anchor and not its view, the anchor still works. If it keeps only a constraint, the anchors and views at both ends of the constraint are still there. You do not need to keep the views separately to keep constraints working.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const box = new UIView();
  box.backgroundColor = 'systemGreen';
  box.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(box);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    box.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
    box.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    box.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    box.heightAnchor.constraintEqualToConstant(44),
  ]);
});
```

**Effect**: a green bar at the top of the safe area, 12 pt from the top edge, 16 pt from the safe area on the left and right, and 44 pt tall. The left and right margins and the fixed height are asserted in the acceptance tests; the constraint aligning the top edge is **not verified in the simulator**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[a.leadingAnchor constraintEqualToAnchor:b.trailingAnchor]` | `a.leadingAnchor.constraintEqualToAnchor(b.trailingAnchor)` |
| `[a.topAnchor constraintEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintEqualToAnchor(b.bottomAnchor, { constant: 8 })` |
| `[a.topAnchor constraintGreaterThanOrEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintGreaterThanOrEqualToAnchor(b.bottomAnchor, { constant: 8 })` |

## See also

- [`NSLayoutConstraint`](auto-layout.md): the constraints the methods return
- [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md), [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md), [`NSLayoutDimension`](ns-layout-dimension.md): the extra methods of each anchor type
- [Laying out with constraints](../guides/auto-layout.md)
