# Placing views on screen

This guide shows how to use [`UIView`](../api/ui-view.md) to put things on screen: creating views, giving them a position and size, setting their appearance, and adding them to the view hierarchy, as well as adjusting stacking order, hiding, removing, rounding corners, clipping, transforming, and responding to taps. The details of each property and method are on the [`UIView`](../api/ui-view.md) reference page. For animation, see [Animating views](view-animations.md); for all the ways to write constraints, see [Laying out with constraints](auto-layout.md).

## Recommended approach

There are two ways to give a position and size: assign a rectangle to `frame` directly, or write constraints (Auto Layout).

**Constraints are recommended.** `frame` is a fixed value written when that line of code runs, and it doesn't change on its own afterward. Screen widths differ between models, and the size of the safe area differs by model and by where the view controller sits. Fixed coordinates written for one screen width end up misplaced on another. Measured: a set of fixed coordinates written for a 420 pt wide screen, placed on a 390 pt wide iPhone 14, had its rightmost column cut off. Constraints describe relationships between views ("left edge 16 pt from the safe area"); the system computes the result for the current screen and recomputes it when the superview's size or the safe area changes.

`frame` suits two cases:

- The superview's size is fixed, and the subview's position within it is fixed too. For example, a small dot inside a 44 × 44 pt icon container.
- The position is computed by code at some moment, and code updates it afterward. For example, a view moved by a timer or a [per-frame callback](../api/ca-animation.md).

The cost is that when the superview's size changes, your code must assign `frame` again.

Use only one approach per view; see [The two ways to position](../api/ui-view.md#two-ways-to-position-views) for the rules.

## First example

The code below starts from a blank App and puts an indigo rectangle on screen, with a small orange square inside it.

```js
application.addEventListener('sceneconnect', (e) => {
  // Build the window and view controller. Every App needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the view
  const card = new UIView();

  // 2. Set its position and size: top-left corner at (40, 120), 200 wide, 120 tall
  card.frame = new CGRect(40, 120, 200, 120);

  // 3. Set its background color
  card.backgroundColor = 'systemIndigo';

  // 4. Put it on the view controller. page.view is the view controller's own root view
  page.view.addSubview(card);

  // 5. Put a subview inside card. Its coordinates are relative to card's top-left corner
  const dot = new UIView();
  dot.frame = new CGRect(16, 16, 40, 40);
  dot.backgroundColor = 'systemOrange';
  card.addSubview(dot);

  // 6. Convert dot's top-left corner into the view controller's coordinates
  const p = dot.convertPoint(new CGPoint(0, 0), { toView: page.view });
  console.log(p.x, p.y);
});
```

**Effect**

- An indigo rectangle appears on screen, 200 pt wide and 120 pt tall, with its left edge 40 pt from the left of the screen and its top edge 120 pt from the top of the screen.
- Inside the rectangle's top-left corner is a 40 × 40 pt orange square, 16 pt from the rectangle's left and top edges.
- The console logs `56 176`, that is, 40 + 16 and 120 + 16.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

The four basic steps are: create, give a position and size, set the appearance, add to a superview. Every usage that follows is a variation on these four steps.

This example positions with `frame` because both rectangles have fixed positions and sizes. For views whose position should follow the screen size, use constraints; see [Positioning with constraints](#positioning-with-constraints).

After the callback ends, the variables `card` and `dot` no longer exist, but both views are still shown: they are in the view hierarchy, kept by their superviews.

## Why a new view is invisible

A view from `new UIView()` has three default states, and if any one of them isn't changed, it can't be seen on screen:

| Default state | Result | How to change it |
| --- | --- | --- |
| `frame` is `(0, 0, 0, 0)` | Width and height are 0 pt; it has no area | Assign `frame`, or determine its position and size with constraints |
| `backgroundColor` is `null` | The view is transparent. It has a size and can contain subviews, but draws nothing itself | Assign a color to `backgroundColor`. A container used only to hold subviews can stay transparent |
| No superview | Not in any window, not shown | Add it with `addSubview()` to a view that is already in a window, usually the view controller's root view `page.view` |

Views positioned with constraints have a fourth case: `translatesAutoresizingMaskIntoConstraints` wasn't set to `false`. Then even correct constraints don't change the view's position and size; see [The two ways to position](../api/ui-view.md#two-ways-to-position-views).

When constraints are wrong or insufficient, the system logs nothing to the console. Check with [`hasAmbiguousLayout`](../api/ui-view/hasambiguouslayout.md), [`exerciseAmbiguityInLayout()`](../api/ui-view/exerciseambiguityinlayout.md), and [`constraintsAffectingLayoutForAxis()`](../api/ui-view/constraintsaffectinglayoutforaxis.md).

## Who keeps a view

**A view added to the view hierarchy doesn't need to be kept in a variable.** A superview keeps its subviews: as long as a view is in a window's view hierarchy, it isn't garbage-collected, and the event listeners and custom properties attached to it are kept. To use it later, reading it from `superview`, `subviews`, or `viewWithTag()` gives the same object.

After a view is removed from its superview, whether it still exists depends on whether the App's code kept it:

| Case | Result |
| --- | --- |
| A variable holds it | The view still exists, with all its properties. It can be added back with `addSubview()`. **Adding it back is not verified in the simulator** |
| No variable holds it | The view is garbage-collected along with its subviews and event listeners. You don't need to call `removeEventListener()` first |

So the recommended approach is: to discard a part of the UI, call `removeFromSuperview()` and don't keep it; rebuild it from data when needed. Only keep a view in a variable for reuse when it is expensive to rebuild, at the cost of it staying in memory.

If you keep a view in a variable outside the `sceneconnect` callback, it isn't garbage-collected after the scene is destroyed; see [`UIWindowScene`](scenes-and-windows.md#recommended-approach).

The sections below reuse `page`, `card`, and `dot` from the first example. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const card = new UIView();
page.view.addSubview(card);
const dot = new UIView();
card.addSubview(dot);
```

## Changing position and size

The `frame` you read is a read-only value; you can't change just one of its fields. To change it, assign a whole new one.

```js
const f = card.frame;
card.frame = new CGRect(f.x, f.y + 100, f.width, f.height);
```

**Effect**: the rectangle moves down 100 pt with the same size. The orange square inside moves with it.

You can also assign a plain object, with all four fields present:

```js
card.frame = { x: 60, y: 270, width: 160, height: 80 };
```

**Effect**: the rectangle moves to `(60, 270)` and becomes 160 pt wide and 80 pt tall.

Writing `card.frame.x = 10` throws `TypeError`; see [Structs are read-only values](../api/ui-view.md#structs-are-read-only-values) for why.

When `card` is positioned with constraints, don't change its `frame`; change the constraints. See [The two ways to position](../api/ui-view.md#two-ways-to-position-views).

## Centering a view in its superview

`center` is the coordinate of the view's center point in its superview. Set it to the middle of the superview.

```js
const size = page.view.bounds;
card.center = new CGPoint(size.width / 2, size.height / 2);
```

**Effect**: the rectangle moves to the center of the screen with the same size. **Not verified in the simulator.**

This only takes effect at the moment it runs. If the superview's size changes later, the rectangle doesn't re-center automatically. To keep it centered, use [constraints](#positioning-with-constraints): align `centerXAnchor` and `centerYAnchor` with the superview's anchors of the same names.

## Avoiding the notch and the home indicator

The top of the screen has the notch and the status bar, and the bottom has the home indicator. The area not covered by them is called the **safe area**. `safeAreaInsets` gives the distances from the safe area's four edges to the view's four edges.

```js
const insets = page.view.safeAreaInsets;

const bar = new UIView();
bar.frame = new CGRect(0, insets.top, page.view.bounds.width, 44);
bar.backgroundColor = 'systemTeal';
page.view.addSubview(bar);
```

**Effect**: a 44 pt tall teal bar spanning the screen from left to right, with its top edge right below the notch and status bar, not covered by them. **Not verified in the simulator.**

Before a view is shown on screen, `safeAreaInsets` reads 0 pt on all four sides (measured: the root view of a view controller not yet in a window). So this code must run after the view is shown for the values to be correct.

Constraints are recommended: content aligned to `safeAreaLayoutGuide` falls into place automatically during layout, without reading this value and regardless of when it is read. See [Positioning with constraints](#positioning-with-constraints).

## Giving a view inner margins

`directionalLayoutMargins` is a view's [layout margins](../api/ui-view.md#layout-margins): how far content should be from the view's four edges. It doesn't move subviews by itself. Subviews must align to `layoutMarginsGuide` with constraints to be inset by the margins.

```js
card.directionalLayoutMargins = { top: 12, leading: 20, bottom: 12, trailing: 20 };

const caption = new UILabel();
caption.text = 'Caption';
caption.translatesAutoresizingMaskIntoConstraints = false;
card.addSubview(caption);

const margins = card.layoutMarginsGuide;
NSLayoutConstraint.activateConstraints([
  caption.topAnchor.constraintEqualToAnchor(margins.topAnchor),
  caption.leadingAnchor.constraintEqualToAnchor(margins.leadingAnchor),
]);

console.log(String(card.directionalLayoutMargins));
```

**Effect**:

- The text "Caption" appears in the top-left corner of the rectangle, 12 pt from its top edge and 20 pt from its left edge. **Not verified in the simulator.**
- The console logs `NSDirectionalEdgeInsets(12, 20, 12, 20)`.

When a group of views should be arranged in a row or column with margins, use [`UIStackView`](../api/ui-stack-view.md) instead of writing these constraints.

## Adjusting stacking order

When subviews of the same superview overlap, the one added later is drawn on top.

```js
const a = new UIView();
a.frame = new CGRect(40, 300, 120, 120);
a.backgroundColor = 'systemRed';
page.view.addSubview(a);

const b = new UIView();
b.frame = new CGRect(100, 360, 120, 120);
b.backgroundColor = 'systemBlue';
page.view.addSubview(b);
```

**Effect**: the red square and the blue square partly overlap, and the overlapping area shows blue.

Bring the red one to the top:

```js
page.view.bringSubviewToFront(a);
```

**Effect**: the overlapping area now shows red. **Not verified in the simulator.**

To specify the order directly when adding, use `insertSubview()`:

```js
const c = new UIView();
c.frame = new CGRect(70, 330, 120, 120);
c.backgroundColor = 'systemOrange';
page.view.insertSubview(c, { belowSubview: a });
```

**Effect**: the orange square is added one layer below the red square.

## Removing a view

```js
dot.removeFromSuperview();
```

**Effect**: the orange square disappears from the screen. `dot.superview` becomes `null`, and it is no longer in `card.subviews`.

Whether the view still exists after removal depends on whether a variable holds it:

- The `dot` variable here still exists, so the view does too, and it can be added back with `addSubview()` later. **Adding it back is not verified in the simulator.**
- When no variable holds it, the view is garbage-collected, and its event listeners go with it. You don't need to remove the listeners one by one first.

Whether calling `removeFromSuperview()` on a view with no superview throws is **not verified in the simulator**.

To move a view from one superview to another, you don't need to remove it first; call `addSubview()` on the new superview directly. See [The view hierarchy and stacking order](../api/ui-view.md#view-hierarchy-and-stacking-order).

## Hiding a view

```js
card.isHidden = true;
```

**Effect**: the rectangle and its subviews are not shown and don't receive touches. Setting it back to `false` restores them. **Not verified in the simulator.**

A hidden view is still in the view hierarchy and still occupies its `frame`. Only views inside a [`UIStackView`](../api/ui-stack-view.md) give up their space when hidden.

Choosing between hiding and removing: use `isHidden` for a view you'll show again, which keeps its properties, subviews, and event listeners; use `removeFromSuperview()` for a view you no longer need, and its memory is reclaimed when no variable holds it.

## Making it semi-transparent

```js
card.alpha = 0.5;
```

**Effect**: the rectangle becomes semi-transparent, and the content behind it shows through. Its subviews become semi-transparent along with it.

To make only the background semi-transparent without affecting subviews, put the transparency in the color:

```js
card.alpha = 1;
card.backgroundColor = 'rgba(88, 86, 214, 0.5)';
```

**Effect**: the rectangle's background is semi-transparent, and the orange square inside stays opaque. **Not verified in the simulator.**

By iOS's rules, a view with `alpha` below 0.01 doesn't receive touches; touches go to the view behind it. So you can't use `alpha = 0` to make an "invisible but tappable" area; to do that, keep `alpha` at 1 and set `backgroundColor` to `null`. **These two points are not verified in the simulator.**

## Adding rounded corners

Rounded corners are set on the view's layer. A layer is the object behind a view that does the drawing; get it through `view.layer`.

```js
card.layer.cornerRadius = 12;
```

**Effect**: the rectangle's four corners become rounded with a 12 pt radius.

Borders and shadows are also on the layer; see [`CALayer`](../api/ca-layer.md).

## Clipping subviews that extend beyond the bounds

By default, the part of a subview that extends beyond its superview's bounds is shown as usual, not clipped. Whether the part beyond the superview's bounds receives touches is **not verified in the simulator**.

```js
dot.frame = new CGRect(180, 100, 40, 40);   // half outside card
card.clipsToBounds = true;
```

**Effect**: only the part of the orange square inside the rectangle is shown; the part beyond it isn't. **Not verified in the simulator.**

After setting rounded corners, making subviews clip to the rounded corners also requires `clipsToBounds = true`.

## Rotating and scaling

```js
dot.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));
```

**Effect**: the orange square scales up to 1.2 times around its own center and rotates 30° clockwise.

Angles are in radians. To restore the original:

```js
dot.transform = CGAffineTransform.identity;
```

> **Note:** after setting a transform, don't read or write `frame`; use `bounds` and `center` instead. See [Transforms and `frame`](../api/ui-view.md#transforms-and-frame) for why.

## Making a view ignore touches

```js
card.isUserInteractionEnabled = false;
```

**Effect**: the rectangle and its subviews don't receive touches. Touches go to the view behind it. The appearance doesn't change. **Not verified in the simulator.**

## Making an ordinary view respond to taps

`UIView` doesn't fire tap events itself. To make an ordinary view respond to a tap or long press, add a gesture recognizer to it:

```js
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('Tapped');
});
card.addGestureRecognizer(tap);
```

**Effect**: tapping the rectangle logs `Tapped` to the console.

Once added to a view, the recognizer is kept by the view, so you don't need to keep the `tap` variable. For the full description, see [Gesture recognizers](../api/ui-gesture-recognizer.md).

If what you want is a button, use [`UIButton`](../api/ui-button.md) directly: it comes with a pressed appearance and a disabled state.

## Positioning with constraints

Constraints describe a view's position and size in relation to other things: "left edge 16 pt from the safe area", "60 pt tall". The system computes `frame` from the constraints and recomputes it automatically when the superview's size or the safe area changes. This mechanism is called Auto Layout.

```js
const banner = new UIView();
banner.backgroundColor = 'secondarySystemBackground';
banner.translatesAutoresizingMaskIntoConstraints = false;   // required for views that use constraints
page.view.addSubview(banner);

const guide = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  banner.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
  banner.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
  banner.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -24 }),
  banner.heightAnchor.constraintEqualToConstant(60),
]);
```

**Effect**: a 60 pt tall light gray bar appears at the bottom of the screen. Its left and right edges are each 16 pt from the safe area, and its bottom edge is 24 pt above the bottom of the safe area.

The four constraints determine the left, right, and bottom edges and the height. A view's constraints must be enough to determine its position and size: two quantities horizontally and two vertically. When constraints are insufficient, the system doesn't report an error, and the view's position or size is undetermined; check with [`hasAmbiguousLayout`](../api/ui-view/hasambiguouslayout.md).

For all the ways to write constraints, see the guide [Laying out with constraints](auto-layout.md).

## Reading the position computed by constraints

Constraints don't take effect immediately; the system computes them at the next layout pass. Reading `frame` right after activating constraints gives the value from before layout. To read the result right away, call `layoutIfNeeded()` first. `banner` is the bar positioned with constraints in the previous section; the first few lines rebuild it:

```js
const banner = new UIView();
banner.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(banner);
const guide = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  banner.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
  banner.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
  banner.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -24 }),
  banner.heightAnchor.constraintEqualToConstant(60),
]);

page.view.layoutIfNeeded();
console.log(banner.frame.width, banner.frame.height);
```

**Effect**: the console logs the bar's width and height. The height is `60`, and the width is the safe area's width minus 32.

## Measuring how much space content needs

Views such as text and buttons know how much space their content needs. `sizeThatFits()` asks "given at most this much space, how much do you need?" and returns the answer immediately without changing the view.

```js
const label = new UILabel();
label.text = 'Hello, Nacre';

const need = label.sizeThatFits(new CGSize(300, 1000));
label.frame = new CGRect(40, 500, need.width, need.height);
page.view.addSubview(label);
```

**Effect**: a line of text appears on screen, and the view's size exactly matches the text's size.

`label.sizeToFit()` does "measure the size and resize to it" in one step, keeping the position.

## Finding which view is at a point

```js
const hit = page.view.hitTest(new CGPoint(50, 130));
if (hit) {
  console.log(hit === card);
}
```

**Effect**: the point `(50, 130)` is inside the rectangle and not inside the orange square, so the console logs `true`. **Not verified in the simulator.**

Returns `null` when there is no view at that point.

## Finding a view by tag

Give a view an integer tag, and later find it from any of its ancestors.

```js
dot.tag = 42;

const found = page.view.viewWithTag(42);
if (found) {
  found.backgroundColor = 'systemRed';
}
```

**Effect**: the orange square turns red.

Returns `null` if not found.

## Dismissing the keyboard

```js
page.view.endEditing(true);
```

**Effect**: if a text field inside this view is being edited, it loses focus and the keyboard goes away. For text fields, see [Text fields and the keyboard](../api/ui-text-field.md).

## See also

- [`UIView`](../api/ui-view.md): all members
- [Animating views](view-animations.md)
- [Laying out with constraints](auto-layout.md)
- [Arranging views in a row or column](stack-views.md)
- [`CALayer`](../api/ca-layer.md): rounded corners, borders, shadows
- [Gesture recognizers](../api/ui-gesture-recognizer.md)
