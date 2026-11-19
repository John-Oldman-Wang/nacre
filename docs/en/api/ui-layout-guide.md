---
type: reference
native: UILayoutGuide
---

# `UILayoutGuide`

**`UILayoutGuide`** represents a rectangle that takes part in layout but isn't displayed, called a layout guide. It has the same anchors as a view and can be used to create constraints, but it is not a view: it has no background color, doesn't receive touches, and doesn't appear in `subviews`.

Layout guides are for spacing, grouping, and alignment. When you need a rectangle that only takes part in layout, use one instead of a transparent `UIView`. The system also provides several ready-made layout guides, such as `view.safeAreaLayoutGuide` for the safe area.

**Inheritance**: `EventTarget` → `NSObject` → `UILayoutGuide`

Subclass: [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md) (with `UITrackingLayoutGuide` in between, a layer that has no members of its own).

For usage, see the guide [Laying out with constraints](../guides/auto-layout.md#using-an-invisible-rectangle-as-a-placeholder).

## Constructor

[`UILayoutGuide()`](ui-layout-guide/constructor.md)

Creates a layout guide. Add it to a view with the view's [`addLayoutGuide()`](ui-view/addlayoutguide.md) before using it.

## Instance properties

| Property | Description |
| --- | --- |
| [`owningView`](ui-layout-guide/owningview.md) <small>read-only</small> | The view it has been added to |
| [`layoutFrame`](ui-layout-guide/layoutframe.md) <small>read-only</small> | The rectangle computed by layout, in the coordinate system of `owningView` |
| [`identifier`](ui-layout-guide/identifier.md) | A name for identifying it when debugging |

10 anchors, with the same meanings as the anchors of the same names on a view. It has two fewer than a view, the baseline anchors, because it has no text:

| Property | Description |
| --- | --- |
| [`leadingAnchor`](ui-layout-guide/leadinganchor.md) <small>read-only</small> | Leading edge |
| [`trailingAnchor`](ui-layout-guide/trailinganchor.md) <small>read-only</small> | Trailing edge |
| [`leftAnchor`](ui-layout-guide/leftanchor.md) <small>read-only</small> | Left edge |
| [`rightAnchor`](ui-layout-guide/rightanchor.md) <small>read-only</small> | Right edge |
| [`centerXAnchor`](ui-layout-guide/centerxanchor.md) <small>read-only</small> | Horizontal center line |
| [`topAnchor`](ui-layout-guide/topanchor.md) <small>read-only</small> | Top edge |
| [`bottomAnchor`](ui-layout-guide/bottomanchor.md) <small>read-only</small> | Bottom edge |
| [`centerYAnchor`](ui-layout-guide/centeryanchor.md) <small>read-only</small> | Vertical center line |
| [`widthAnchor`](ui-layout-guide/widthanchor.md) <small>read-only</small> | Width |
| [`heightAnchor`](ui-layout-guide/heightanchor.md) <small>read-only</small> | Height |

## Events

`UILayoutGuide` fires no events. There is no notification when `layoutFrame` changes; when you need it, read it after `layoutIfNeeded()`.

## Concepts

A layout guide is a rectangle that takes part in layout but isn't displayed. It has the same anchors as a view, and constraints can be created with it. It is not a view: it has no background color, doesn't receive touches, and doesn't appear in `subviews`.

### Layout guides the system provides

Read them from properties of a view:

| Property | Area it represents |
| --- | --- |
| [`view.safeAreaLayoutGuide`](ui-view/safearealayoutguide.md) | The safe area: the part of the view not covered by the notch, the status bar, the rounded screen corners, or the home indicator at the bottom |
| [`view.layoutMarginsGuide`](ui-view/layoutmarginsguide.md) | The area inset from each edge of the view by its [layout margins](ui-view/directionallayoutmargins.md). The margins default to 8 pt on each side and can be changed |
| [`view.readableContentGuide`](ui-view/readablecontentguide.md) | A width suited to reading long text. When the view is very wide, it is narrower than the view |
| [`view.keyboardLayoutGuide`](ui-view/keyboardlayoutguide.md) | The area the keyboard occupies. See [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md) |
| `scrollView.contentLayoutGuide`, `frameLayoutGuide` | The content area and visible area of a scroll view. See [`UIScrollView`](ui-scroll-view.md) |

The exact extents of `layoutMarginsGuide` and `readableContentGuide` are **not verified in the simulator**.

### Layout guides you create

Create one with `new UILayoutGuide()`, then add it to a view with `view.addLayoutGuide()`. Only after it is added can constraints be created with it. For an example, see [Using an invisible rectangle as a placeholder](../guides/auto-layout.md#using-an-invisible-rectangle-as-a-placeholder). Common uses:

- Spacing: represent a gap, and make several gaps equal.
- Grouping: enclose several views in one rectangle, then center that rectangle as a whole.

A layout guide's size and position must also be determined by constraints. After layout, read its rectangle from `layoutFrame`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // An invisible rectangle filling the top half of the safe area
  const top = new UILayoutGuide();
  page.view.addLayoutGuide(top);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    top.topAnchor.constraintEqualToAnchor(safe.topAnchor),
    top.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    top.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
    top.heightAnchor.constraintEqualToAnchor(safe.heightAnchor, { multiplier: 0.5 }),
  ]);

  // A square centered in that rectangle
  const box = new UIView();
  box.backgroundColor = 'systemOrange';
  box.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(box);
  NSLayoutConstraint.activateConstraints([
    box.centerXAnchor.constraintEqualToAnchor(top.centerXAnchor),
    box.centerYAnchor.constraintEqualToAnchor(top.centerYAnchor),
    box.widthAnchor.constraintEqualToConstant(80),
    box.heightAnchor.constraintEqualToConstant(80),
  ]);
});
```

**Effect**: an 80 × 80 pt orange square, centered in the top half of the safe area. The layout guide itself is invisible. **This code is not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UILayoutGuide alloc] init]` | `new UILayoutGuide()` |
| `[view addLayoutGuide:guide]` | `view.addLayoutGuide(guide)` |
| `view.safeAreaLayoutGuide` | `view.safeAreaLayoutGuide` |
| `guide.layoutFrame` | `guide.layoutFrame` |

## See also

- [`NSLayoutConstraint`](auto-layout.md)
- [`UIView`](ui-view.md): `addLayoutGuide()`, `removeLayoutGuide()`, `layoutGuides`, and the layout guides the system provides
- [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md)
- [`UIScrollView`](ui-scroll-view.md): `contentLayoutGuide`, `frameLayoutGuide`
