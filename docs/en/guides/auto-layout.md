# Laying out with constraints

This guide covers how to position views with constraints (Auto Layout): fixed width and height, centering, pinning to edges, avoiding the notch, stacking vertically, equal widths, proportions, minimum and maximum sizes, expanding and collapsing, placeholders, following the keyboard, and how to investigate when constraints are wrong. The details of constraints, anchors, and layout guides are on the reference pages for [`NSLayoutConstraint`](../api/auto-layout.md), [`NSLayoutAnchor`](../api/ns-layout-anchor.md), and [`UILayoutGuide`](../api/ui-layout-guide.md).

## Recommended approach

- **To arrange views in a row or column, use [`UIStackView`](../api/ui-stack-view.md) instead of writing constraints by hand.** It creates the constraints for its subviews, and when one item is hidden the others rearrange automatically. Write constraints by hand for what it cannot express: placing the outermost container in the view controller, centering, aspect ratios, and aligning two views that are not adjacent.
- **Activate a set of constraints at once with `NSLayoutConstraint.activateConstraints([…])`.** When activating one at a time, the first few are already in effect while the rest are not, passing through a state where the constraints are incomplete.
- **To change the layout, change a constraint's `constant`; do not deactivate the old constraint and create a new one.** Keep the constraint object in a variable and assign to it later: `cardHeight.constant = 84`. After a constraint is created, `constant` is the only number that can change; only when changing the multiplier, the relation, or the connected anchors do you need to [replace the constraint](#deactivating-and-replacing-constraints).
- **Align to the safe area, not to the view controller's root view.** The safe area is the region of a view not covered by the notch, the status bar, the rounded screen corners, or the home indicator; get it with `view.safeAreaLayoutGuide`.
- **Give names (`identifier`) to constraints you will want to inspect later.** Wrong constraints produce no output at all, so you can only list the constraints yourself to check them, and you can tell which is which only if they have names.

## First example

The code below starts from a blank app and places a card at the bottom of the screen with three colored blocks side by side inside it. The left and right blocks have fixed widths, and the middle block fills the remaining width.

```
left edge of safe                                    right edge of safe
│                                                    │
│<16>┌───────────────── card ─────────────────┐<16>│
│    │<8>┌──────┐<8>┌────────────┐<8>┌──────┐<8>│    │
│    │   │ left │   │   middle   │   │ right│   │    │  card is 60 tall
│    │   │  60  │   │    auto    │   │  60  │   │    │  8 above and below the blocks
│    │   └──────┘   └────────────┘   └──────┘   │    │
│    └──────────────────────────────────────────┘    │
│                        24                          │
└─────────────────── bottom edge of safe ────────────┘
```

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Get the safe area's layout guide. Aligned to it, the card is not covered by the notch or the home indicator
  const safe = page.view.safeAreaLayoutGuide;

  // 2. Create the card. Every view positioned with constraints must turn this property off first
  const card = new UIView();
  card.translatesAutoresizingMaskIntoConstraints = false;
  card.backgroundColor = 'secondarySystemBackground';
  page.view.addSubview(card);

  // 3. Create three colored blocks and put them in the card
  const left = new UIView();
  const middle = new UIView();
  const right = new UIView();
  const colors = ['systemRed', 'systemOrange', 'systemBlue'];
  [left, middle, right].forEach((v, i) => {
    v.translatesAutoresizingMaskIntoConstraints = false;
    v.backgroundColor = colors[i];
    card.addSubview(v);
  });

  // 4. Write the constraints. This step only creates them; they are not in effect yet
  const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
  const constraints = [
    // Card: 16 from the safe area on left and right, bottom 24 from the safe area's bottom, 60 tall
    card.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    card.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    card.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor, { constant: -24 }),
    cardHeight,
    // Left block: 8 from the card's left edge, 60 wide
    left.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor, { constant: 8 }),
    left.widthAnchor.constraintEqualToConstant(60),
    // Middle block: left edge 8 from the left block. No width given
    middle.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor, { constant: 8 }),
    // Right block: left edge 8 from the middle block, right edge 8 from the card's right edge, 60 wide
    right.leadingAnchor.constraintEqualToAnchor(middle.trailingAnchor, { constant: 8 }),
    right.trailingAnchor.constraintEqualToAnchor(card.trailingAnchor, { constant: -8 }),
    right.widthAnchor.constraintEqualToConstant(60),
  ];
  // The top and bottom edges of all three blocks are 8 from the card
  for (const v of [left, middle, right]) {
    constraints.push(v.topAnchor.constraintEqualToAnchor(card.topAnchor, { constant: 8 }));
    constraints.push(v.bottomAnchor.constraintEqualToAnchor(card.bottomAnchor, { constant: -8 }));
  }

  // 5. Activate all the constraints at once
  NSLayoutConstraint.activateConstraints(constraints);

  // 6. Complete layout right away, so the frames read below are the results computed from the constraints
  page.view.layoutIfNeeded();
  console.log(card.frame.width, card.frame.height);
  console.log(left.frame.width, middle.frame.width, right.frame.width);
});
```

**Effect**

- A light gray card appears at the bottom of the screen, with red, orange, and blue blocks inside it from left to right.
- The card's width is the safe area's width minus 32 pt, and it is 60 pt tall.
- The left and right blocks are 60 pt wide. The middle block's width is the card's width minus 152 pt (two 60s plus four 8s).
- The three blocks are 44 pt tall (60 minus 8 above and 8 below).
- The console prints two lines of numbers, which are the values above.

This example's layout is the same as in the acceptance tests, and all the sizes above have been asserted in the simulator. The acceptance tests use `UIColor` objects for the colors; here they are strings.

Key points about constraints in this example:

- Constraints are created from **anchors**: `card.leadingAnchor.constraintEqualToAnchor(…)`.
- Offsets to the right and downward are positive. The card's right edge is 16 pt to the **left** of the safe area's right edge, so it is `-16`.
- The middle block has no width. Its left and right edges are determined by the left and right blocks, and its width is computed from them.
- After a constraint is created, it must be **activated** to take effect.

## A view does not appear or is in the wrong place

When constraints are wrong, **the system outputs nothing** (measured: nothing in standard output, standard error, or the system log), and the app does not crash. The view simply does not appear, or appears in an unexpected place. The three most common causes:

| Cause | Symptom | How to confirm |
| --- | --- | --- |
| `translatesAutoresizingMaskIntoConstraints` was not set to `false` | The constraints are all written, but the view's position and size do not change. A new view has a size of 0, so it is not visible | Read this property; if it is `true`, it was missed |
| The constraints were not activated | The same as not having written them | Read the constraint's `isActive`; if it is `false`, it was not activated |
| Not enough constraints; some quantity is not determined | The view's width or height is 0, or its position is wrong | Call `layoutIfNeeded()` first, then read `view.hasAmbiguousLayout`; if it is `true`, there are not enough |

Two other kinds of mistake do report clear errors:

- When the views at the two ends of a constraint are not in the same view hierarchy (for example, one of them has not been added with `addSubview()` yet), activation throws `TypeError`. So add the views to the view hierarchy first, then activate the constraints.
- Connecting a vertical anchor to a horizontal anchor throws `TypeError` at creation.

When several required constraints contradict each other (the same view has both "width = 100" and "width = 200"), the system drops one of them, again with no output. For how to check, see [Checking whether there are enough constraints](#checking-whether-there-are-enough-constraints).

## Setup: a function that creates views

The following sections reuse `page`, `safe`, `card`, `left`, `middle`, `right`, and `cardHeight` from the first example. Examples that need new views create them with `addBox()`: it creates a view with a background color, turns off `translatesAutoresizingMaskIntoConstraints`, and adds it to the view controller's root view. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const safe = page.view.safeAreaLayoutGuide;
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(card);
const left = new UIView();
const middle = new UIView();
const right = new UIView();
for (const v of [left, middle, right]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  card.addSubview(v);
}
const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
cardHeight.isActive = true;

/** @param {string} color */
function addBox(color) {
  const v = new UIView();
  v.translatesAutoresizingMaskIntoConstraints = false;
  v.backgroundColor = color;
  page.view.addSubview(v);
  return v;
}
```

**Effect**: Each call to `addBox()` adds one subview to the view controller's root view. It has no constraints yet, so it has no position or size and is not visible on screen (**not verified in the simulator**).

## Fixed width and height

```js
const box = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  box.widthAnchor.constraintEqualToConstant(120),
  box.heightAnchor.constraintEqualToConstant(80),
]);
```

**Effect**: `box` is 120 pt wide and 80 pt tall.

These two only determine the size. The position needs two more constraints; see the following sections.

## Centering

```js
const centerBox = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  centerBox.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  centerBox.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  centerBox.widthAnchor.constraintEqualToConstant(120),
  centerBox.heightAnchor.constraintEqualToConstant(80),
]);
```

**Effect**: A 120 × 80 pt green rectangle in the center of the view controller. **Not verified in the simulator.**

```
┌─────────────────────┐
│          ┆          │
│       ┌──┆──┐       │
│┄┄┄┄┄┄┄│┄┄┼┄┄│┄┄┄┄┄┄┄│   centerBox.centerX = page.centerX
│       └──┆──┘       │   centerBox.centerY = page.centerY
│          ┆          │
└─────────────────────┘
```

To center only horizontally, write only the `centerXAnchor` constraint and determine the vertical direction with other constraints.

## Pinning to edges with margins

```js
const topBar = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  topBar.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  topBar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  topBar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  topBar.heightAnchor.constraintEqualToConstant(44),
]);
```

**Effect**: `topBar` is at the top of the safe area, 12 pt from the top edge and 16 pt from the safe area on each side, 44 pt tall. Its width is computed from the left and right constraints, and it widens when the screen widens. The left and right margins and the fixed height have been asserted in the acceptance tests; the constraint aligning the top edge is **not verified in the simulator**.

The sign of `constant` follows the coordinate directions: right and down are positive. `topBar`'s right edge is to the left of the safe area's right edge, so it is negative.

## Filling the superview

Align all four edges with the superview.

```js
const overlay = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  overlay.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
  overlay.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
  overlay.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  overlay.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
]);
```

**Effect**: `overlay` is the same size as the view controller's root view, including the areas of the notch and the home indicator. **Not verified in the simulator.**

No width or height is needed. The left and right edges determine x and the width; the top and bottom edges determine y and the height.

## Avoiding the notch and the home indicator

The safe area is the region of a view not covered by the notch, the status bar, the rounded screen corners, or the home indicator. Align to `safe`'s anchors, not `page.view`'s.

```js
const content = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  content.topAnchor.constraintEqualToAnchor(safe.topAnchor),
  content.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor),
  content.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
  content.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
]);
```

**Effect**: `content` fills exactly the safe area. Its top is below the status bar and the notch, and its bottom is above the home indicator. **Not verified in the simulator.**

The usual approach: the background color fills the whole view controller, and text and buttons go within the safe area.

## One view below another, N pt apart

Constrain the lower view's `topAnchor` to the upper view's `bottomAnchor`.

```js
const first = addBox('systemRed');
const second = addBox('systemBlue');
NSLayoutConstraint.activateConstraints([
  first.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  first.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  first.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  first.heightAnchor.constraintEqualToConstant(44),

  // second's top = first's bottom + 8
  second.topAnchor.constraintEqualToAnchor(first.bottomAnchor, { constant: 8 }),
  second.leadingAnchor.constraintEqualToAnchor(first.leadingAnchor),
  second.trailingAnchor.constraintEqualToAnchor(first.trailingAnchor),
  second.heightAnchor.constraintEqualToConstant(44),
]);
```

**Effect**: The red block is on top, and the blue block is 8 pt below it; the two are aligned left and right and equally wide. **Not verified in the simulator.**

```
┌──────────────────┐
│      first       │
└──────────────────┘
         ↕ 8          second.top = first.bottom + 8
┌──────────────────┐
│      second      │
└──────────────────┘
```

If you later change `first`'s height, `second` moves along automatically. Write adjacent views one after another like this. When many views are arranged in a column, [`UIStackView`](../api/ui-stack-view.md) is less work.

## Two views of equal width

Constrain one view's `widthAnchor` to another's `widthAnchor`. The two views need not be adjacent or share a superview; they only need to be in the same window's view hierarchy.

```js
const a = addBox('systemRed');
const b = addBox('systemBlue');
NSLayoutConstraint.activateConstraints([
  a.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  b.leadingAnchor.constraintEqualToAnchor(a.trailingAnchor, { constant: 8 }),
  b.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  // b's width = a's width
  b.widthAnchor.constraintEqualToAnchor(a.widthAnchor),

  a.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  b.topAnchor.constraintEqualToAnchor(a.topAnchor),
  a.heightAnchor.constraintEqualToConstant(44),
  b.heightAnchor.constraintEqualToAnchor(a.heightAnchor),
]);
```

**Effect**: The two blocks sit side by side, 8 pt apart, splitting the remaining width evenly. **Not verified in the simulator.**

No one wrote a specific width. The system computes it from the relationships "the two blocks are equally wide", "left and right margins of 16", and "a gap of 8".

## Half the superview's width

Constraints between size anchors can take a `multiplier`.

```js
const half = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  // half's width = the view controller's width × 0.5
  half.widthAnchor.constraintEqualToAnchor(page.view.widthAnchor, { multiplier: 0.5 }),
  half.heightAnchor.constraintEqualToConstant(44),
  half.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  half.topAnchor.constraintEqualToAnchor(safe.topAnchor),
]);
```

**Effect**: `half`'s width is always half the view controller's width. **Not verified in the simulator.**

`multiplier` and `constant` can be used together: `{ multiplier: 0.5, constant: -8 }` means "half, minus 8 pt".

Only size anchors (`widthAnchor`, `heightAnchor`) can use `multiplier`. In the type definitions, edge and center-line anchors do not accept this option.

## Keeping an aspect ratio

Constrain a view's `heightAnchor` to its own `widthAnchor`.

```js
const cover = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  cover.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  cover.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  cover.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  // height = width × 9/16
  cover.heightAnchor.constraintEqualToAnchor(cover.widthAnchor, { multiplier: 9 / 16 }),
]);
```

**Effect**: `cover`'s width follows the screen, and its height is always 9/16 of its width. **Not verified in the simulator.**

## Limiting minimum and maximum size

Constraints can be inequalities. Replace `Equal` in the method name with `GreaterThanOrEqual` (≥) or `LessThanOrEqual` (≤).

```js
const bubble = addBox('systemGreen');
const preferred = bubble.widthAnchor.constraintEqualToAnchor(
  page.view.widthAnchor, { multiplier: 0.5 });
preferred.priority = 'defaultHigh';   // this one can be overridden by the two below

NSLayoutConstraint.activateConstraints([
  preferred,
  bubble.widthAnchor.constraintGreaterThanOrEqualToConstant(100),   // at least 100 wide
  bubble.widthAnchor.constraintLessThanOrEqualToConstant(300),      // at most 300 wide
  bubble.heightAnchor.constraintEqualToConstant(44),
  bubble.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  bubble.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
]);
```

**Effect**: `bubble`'s width is half the view controller's width, but no less than 100 pt and no more than 300 pt. **Not verified in the simulator.**

The priority of the "half" constraint is lowered. When half the view controller's width exceeds 300, it contradicts "at most 300 wide", and the system keeps the one with higher priority. For priority rules, see [`priority`](../api/auto-layout/priority.md).

Inequality constraints can also be used on edges. `a.leadingAnchor.constraintGreaterThanOrEqualToAnchor(b.trailingAnchor, { constant: 8 })` means "`a` is at least 8 pt to the right of `b`".

## Changing a constraint's constant later (expanding and collapsing)

To change a layout already on screen (expand, collapse, move), changing a constraint's `constant` is recommended. Keep the constraint in a variable when creating it, and assign to it later.

```js
cardHeight.constant = 84;
page.view.layoutIfNeeded();
console.log(card.frame.height);   // 84
```

**Effect**: The card's height changes from 60 pt to 84 pt. Because the card's bottom edge is fixed, it grows upward. The three blocks inside the card become 68 pt tall along with it.

After `constant` changes, the system recomputes at the next layout pass. `layoutIfNeeded()` is called to recompute immediately, so that the `frame` read on the next line is the new value. You can skip it when you do not need to read `frame` right away.

The change happens immediately, with no transition animation.

When `constant` changes, the constraint object stays the same and other constraints are unaffected. The alternative is to deactivate the old constraint and create and activate a new one, which creates one more constraint object and requires deactivating the old one separately. Use that approach only for changes `constant` cannot express: after a constraint is created, `constant` is the only number that can change; to change the multiplier, the relation, or the connected anchors, you can only [replace the constraint](#deactivating-and-replacing-constraints).

`constant` accepts values that can be converted to numbers; `'84'` and `84` have the same effect. Values that cannot be converted to a finite number (`undefined`, `'abc'`, `NaN`) throw `TypeError: constant must be a finite number, got undefined`, ending with the value received.

## Deactivating and replacing constraints

Deactivate one constraint, then activate another.

```js
// Change the height from a fixed 60 to a quarter of the view controller's height
const tall = card.heightAnchor.constraintEqualToAnchor(
  page.view.heightAnchor, { multiplier: 0.25 });

NSLayoutConstraint.deactivateConstraints([cardHeight]);
NSLayoutConstraint.activateConstraints([tall]);
page.view.layoutIfNeeded();
```

**Effect**: The card's height becomes a quarter of the view controller's height. `cardHeight.isActive` becomes `false`. That `isActive` becomes `false` after deactivation has been asserted in the acceptance tests; the height after switching to the multiplier constraint is **not verified in the simulator**.

A deactivated constraint object still exists and can be activated again later: `cardHeight.isActive = true`.

> **Note:** If you only deactivate without adding a new constraint, that quantity is no longer determined by any constraint. Measured: after deactivating only `cardHeight`, the card's height becomes 16 pt (the two 8 pt margins above and below), and the three blocks become 0 tall. The system reports no error.

## One view sized to its content, the other filling the remaining space

Two text labels side by side: the title on the left fills the remaining width, and the value on the right takes only the width its text needs.

```js
const row = addBox('secondarySystemBackground');
const title = new UILabel();
const value = new UILabel();
title.text = 'Balance';
value.text = '1,024.00';
for (const label of [title, value]) {
  label.translatesAutoresizingMaskIntoConstraints = false;
  row.addSubview(label);
}

// value resists being stretched more, so all the extra width goes to title
value.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });
// value resists being compressed more, so title is compressed first when space runs short
value.setContentCompressionResistancePriority('required', { forAxis: 'horizontal' });

NSLayoutConstraint.activateConstraints([
  row.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 12 }),
  row.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  row.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  row.heightAnchor.constraintEqualToConstant(44),

  title.leadingAnchor.constraintEqualToAnchor(row.leadingAnchor, { constant: 12 }),
  value.leadingAnchor.constraintEqualToAnchor(title.trailingAnchor, { constant: 8 }),
  value.trailingAnchor.constraintEqualToAnchor(row.trailingAnchor, { constant: -12 }),
  title.centerYAnchor.constraintEqualToAnchor(row.centerYAnchor),
  value.centerYAnchor.constraintEqualToAnchor(row.centerYAnchor),
]);
```

**Effect**: "1,024.00" is right-aligned, exactly as wide as its text. The "Balance" label extends from the left all the way to 8 pt left of the value. When the title text is very long, it is the title that gets truncated, and the value is shown in full. **Not verified in the simulator.**

Neither label has a width constraint. Their widths come from the text itself; see [Intrinsic size](../api/auto-layout.md#intrinsic-content-size). For what the two priorities mean, see [Content hugging and compression resistance](../api/auto-layout.md#content-hugging-and-compression-resistance).

Views without an intrinsic size do not need these two priorities. The `middle` in the complete example is a plain `UIView`, and without a width constraint it fills the remaining space automatically.

## Using an invisible rectangle as a placeholder

When you need a rectangle that only takes part in layout and is not displayed, create a `UILayoutGuide`, not a transparent `UIView`. A `UILayoutGuide` does not enter the view hierarchy and does not receive touches.

```js
const spacer = new UILayoutGuide();
spacer.identifier = 'spacer';
card.addLayoutGuide(spacer);

NSLayoutConstraint.activateConstraints([
  spacer.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor),
  spacer.trailingAnchor.constraintEqualToAnchor(middle.leadingAnchor),
  spacer.topAnchor.constraintEqualToAnchor(card.topAnchor),
  spacer.heightAnchor.constraintEqualToConstant(4),
]);
page.view.layoutIfNeeded();
console.log(spacer.layoutFrame.width, spacer.layoutFrame.height);   // 8 4
```

**Effect**: Nothing changes on screen. `spacer` occupies the 8 pt gap between `left` and `middle`, and its `layoutFrame` reads as 8 pt wide and 4 pt tall.

Other views can align to `spacer`'s anchors, written the same way as aligning to a view. For details, see [`UILayoutGuide`](../api/ui-layout-guide.md).

## Following the keyboard

Every view has a `keyboardLayoutGuide`. When the keyboard is hidden, its top is at the bottom edge of the safe area. When the keyboard appears, its top is at the top edge of the keyboard. Constrain the bottom of your content to its `topAnchor`.

```js
const bar = addBox('systemGreen');
NSLayoutConstraint.activateConstraints([
  bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  bar.heightAnchor.constraintEqualToConstant(44),
  bar.bottomAnchor.constraintEqualToAnchor(
    page.view.keyboardLayoutGuide.topAnchor, { constant: -16 }),
]);
```

**Effect**: Without the keyboard, `bar` is 16 pt above the bottom edge of the safe area. When a text field in the view controller gains focus and the keyboard appears, `bar` moves up with the keyboard and stops 16 pt above it. When the keyboard goes away, it returns to its original position. The position when the keyboard is shown is **not verified in the simulator**.

There is no need to listen for keyboard events or compute the keyboard's height. The result of this constraint with the keyboard hidden has been asserted in the acceptance tests: `bar`'s bottom is 16 pt above the bottom edge of the safe area. For how to use text fields, see [Text fields and the keyboard](../api/ui-text-field.md).

## Reading the position computed from constraints

```js
page.view.layoutIfNeeded();
console.log(card.frame.x, card.frame.y, card.frame.width, card.frame.height);
```

**Effect**: The console prints the card's position and size within the view controller's root view, in pt.

If you read `frame` after activating constraints without calling `layoutIfNeeded()`, you get the result of the previous layout pass. For why, see [When constraints produce results](../api/auto-layout.md#when-constraints-are-resolved).

## Checking whether there are enough constraints

When a view does not appear or is in the wrong place, first check whether there are not enough constraints.

```js
page.view.layoutIfNeeded();
console.log(card.hasAmbiguousLayout);   // false

cardHeight.identifier = 'card-height';
for (const c of card.constraintsAffectingLayoutForAxis('vertical')) {
  console.log(c.identifier, c.firstAttribute, c.relation, c.constant, c.priority);
}
```

**Effect**

- The first line prints `false`, meaning the card's position and size are uniquely determined by its constraints.
- After that, each line prints one constraint that affects the card vertically. The line starting with `card-height height equal 60 1000` is the height constraint. The exact content printed by the loop is **not verified in the simulator**.

When `hasAmbiguousLayout` is `true`, this view does not have enough constraints. Give constraints an `identifier` so you can tell which is which in the output. For the three inspection tools, see [`hasAmbiguousLayout`](../api/ui-view/hasambiguouslayout.md), [`exerciseAmbiguityInLayout()`](../api/ui-view/exerciseambiguityinlayout.md), and [`constraintsAffectingLayoutForAxis()`](../api/ui-view/constraintsaffectinglayoutforaxis.md).

## Changing constraints with animation

Changing a constraint has no animation by itself. To animate, after changing the constraint, call `layoutIfNeeded()` inside the `animations` of [`UIView.animateWithDuration()`](../api/ui-view/animatewithduration.md); see [Animating views](view-animations.md#animating-constraint-changes).

## See also

- [`NSLayoutConstraint`](../api/auto-layout.md): constraints, and concepts such as a constraint being an equation, priority, and intrinsic size
- [`NSLayoutAnchor`](../api/ns-layout-anchor.md), [`NSLayoutXAxisAnchor`](../api/ns-layout-x-axis-anchor.md), [`NSLayoutYAxisAnchor`](../api/ns-layout-y-axis-anchor.md), [`NSLayoutDimension`](../api/ns-layout-dimension.md): methods that create constraints
- [`UILayoutGuide`](../api/ui-layout-guide.md), [`UIKeyboardLayoutGuide`](../api/ui-keyboard-layout-guide.md): invisible rectangles and the keyboard
- [`UIView`](../api/ui-view.md): the constraint-related members on views
- [Arranging views in a row or column](stack-views.md): without writing constraints by hand
