---
type: reference
native: NSLayoutConstraint
status: partial
---

# `NSLayoutConstraint`

**`NSLayoutConstraint`** represents a constraint: a relationship between two positions or sizes on two views, such as "the card's left edge is 16 pt to the right of the safe area's left edge" or "the two color blocks are equally wide".

iOS's layout system, Auto Layout, does not ask you to write out each view's position and size. It takes a set of constraints instead. The system computes every view's `frame` (the view's position and size within its superview) from all active constraints, and recomputes it when the screen size changes. All lengths are in [pt](units.md).

Constraints are created from anchors. An anchor is an edge, center line, width, or height of a view that a constraint can refer to, such as `view.leadingAnchor` (the leading edge) or `view.widthAnchor` (the width). The classes in this group are:

| Class | What it is |
| --- | --- |
| `NSLayoutConstraint` (this page) | A single constraint |
| [`NSLayoutAnchor`](ns-layout-anchor.md) | The base class of anchors, with the three methods that create constraints |
| [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md) | Horizontal positions: leading edge, trailing edge, left, right, horizontal center line |
| [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md) | Vertical positions: top, bottom, vertical center line, text baselines |
| [`NSLayoutDimension`](ns-layout-dimension.md) | Sizes: width and height |
| [`UILayoutGuide`](ui-layout-guide.md) | An invisible rectangle used only for alignment |
| [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md) | A layout guide that represents the area the keyboard covers |

The constraint-related properties and methods on views (anchors, `translatesAutoresizingMaskIntoConstraints`, content priorities, debugging members) are on [`UIView`](ui-view.md).

**Inheritance**: `EventTarget` → `NSObject` → `NSLayoutConstraint`

For how to build common layouts with constraints, see the guide [Laying out with constraints](../guides/auto-layout.md).

## Constructor

Can't be created with `new`. Constraints are created by anchor methods such as [`constraintEqualToAnchor()`](ns-layout-anchor/constraintequaltoanchor.md) and [`constraintEqualToConstant()`](ns-layout-dimension/constraintequaltoconstant.md). `new NSLayoutConstraint()` throws `TypeError: Illegal constructor: NSLayoutConstraint is created by the runtime, not by new`. `NSLayoutConstraint` can't be subclassed either.

## Static methods

| Method | Description |
| --- | --- |
| [`NSLayoutConstraint.activateConstraints()`](auto-layout/activateconstraints.md) | Activates a group of constraints at once |
| [`NSLayoutConstraint.deactivateConstraints()`](auto-layout/deactivateconstraints.md) | Deactivates a group of constraints at once |

## Instance properties

| Property | Description |
| --- | --- |
| [`isActive`](auto-layout/isactive.md) | Whether the constraint takes part in layout |
| [`constant`](auto-layout/constant.md) | The constant term of the equation, in pt. The only number you can change after creation |
| [`priority`](auto-layout/priority.md) | The priority, 1 to 1000 |
| [`identifier`](auto-layout/identifier.md) | A name for telling constraints apart while debugging |
| [`multiplier`](auto-layout/multiplier.md) <small>read-only</small> | The multiplier in the equation |
| [`relation`](auto-layout/relation.md) <small>read-only</small> | Equal, greater than or equal, or less than or equal |
| [`firstAttribute`](auto-layout/firstattribute.md) <small>read-only</small> | Which kind of anchor is on the left side of the equation |
| [`secondAttribute`](auto-layout/secondattribute.md) <small>read-only</small> | Which kind of anchor is on the right side of the equation |
| [`firstAnchor`](auto-layout/firstanchor.md) <small>read-only</small> | The anchor on the left side of the equation |
| [`secondAnchor`](auto-layout/secondanchor.md) <small>read-only</small> | The anchor on the right side of the equation. `null` for a constraint to a constant |

These properties fire no events when they change; only the app's own code changes them.

## Events

`NSLayoutConstraint` fires no events.

## Concepts

### Constraints and `frame`

A view can be positioned in two ways: by setting its `frame` directly, or with constraints. Which one a view uses is decided by its `translatesAutoresizingMaskIntoConstraints` property. The property defaults to `true`, which means the view is positioned by its `frame`. A view positioned with constraints must first set it to `false`.

- **Each view uses only one.** For a view that uses constraints, the system overwrites its `frame` with the result of the constraints on every layout pass, so setting `frame` has no effect.
- **Different views can use different ones.** Within the same superview, some subviews can use `frame` while others use constraints. Inside a container positioned by `frame`, subviews can still use constraints.
- **Read the result of constraints from `frame`.** Constraints are not a separate coordinate system. Once the system finishes computing, it writes the result into each view's `frame`.

### Views without constraints

Views have no default position. A view that has `translatesAutoresizingMaskIntoConstraints` turned off but no constraints at all has no position or size and is not visible on screen (**not verified in the simulator**).

Every view needs enough to determine x and width horizontally, and y and height vertically. When one of these quantities is left undetermined, nothing is reported; the system picks a result itself, and a common result is that quantity being 0. Measured: after removing the height constraint from a card, its height went from 60 pt to 16 pt, and the three color blocks inside it became 0 high.

Text, buttons, and images have their own width and height (see [Intrinsic content size](#intrinsic-content-size)), so only their position needs to be determined.

### When constraints take effect

Creating a constraint and making it take effect are two steps. Methods such as `constraintEqualToAnchor()` only create the constraint object; it takes part in layout once activated (`isActive = true` or `NSLayoutConstraint.activateConstraints()`).

Activating it doesn't change the view's `frame` right away either. The system computes everything once, after the current run of JS finishes and before the next screen refresh. So reading `frame` right after activating constraints doesn't give you the new result. To get the result immediately, call `layoutIfNeeded()` on the view controller's root view first, then read `frame`. Code that only sets up the interface and doesn't read `frame` doesn't need to call it.


### A constraint is an equation

A constraint is a linear equation or inequality:

```
viewA.someAnchor  =  viewB.someAnchor × multiplier + constant
                 (= can also be ≥ or ≤)
```

For example, this one from the full example:

```js
const left = new UIView();
const middle = new UIView();
const gap = middle.leadingAnchor.constraintEqualToAnchor(
  left.trailingAnchor, { constant: 8 });
```

means `middle.leading = left.trailing × 1 + 8`.

The five parts of the equation:

| Part | Where it's written | Description |
| --- | --- | --- |
| Left-hand anchor | The anchor the method is called on | `middle.leadingAnchor` |
| Relation | The method name | `constraintEqualTo…` is =, `constraintGreaterThanOrEqualTo…` is ≥, `constraintLessThanOrEqualTo…` is ≤ |
| Right-hand anchor | The first argument | `left.trailingAnchor`. A constraint to a constant has no right-hand anchor |
| `multiplier` | Option | A ratio with no unit. Defaults to 1. Only constraints between widths and heights can have one |
| `constant` | Option | In [pt](units.md). Defaults to 0 |

The system treats all active constraints in the view controller as one system of equations and solves it to get each view's `frame`.

Each view has four unknowns: x, y, width, and height. Horizontally, two independent pieces of information are needed to determine x and width; vertically, two to determine y and height. Common combinations:

| Direction | Combinations that determine both quantities |
| --- | --- |
| Horizontal | left + right; left + width; right + width; horizontal center + width |
| Vertical | top + bottom; top + height; bottom + height; vertical center + height |

Views with an [intrinsic content size](#intrinsic-content-size) (text, buttons, images) have their own width and height, so only their position needs to be determined.

Don't set `frame` on a view that uses constraints. On the next layout pass the system overwrites it with the result of the constraints. To move or resize such a view, change a constraint's `constant`.


### Turning off `translatesAutoresizingMaskIntoConstraints`

Every view positioned with constraints needs this line first:

```js
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
```

**Effect**: `box` is no longer positioned by its `frame`; its position and size are determined entirely by constraints.

Why: iOS has two ways to position a view, setting `frame` directly and writing constraints. This property defaults to `true`, meaning "this view is positioned by its `frame`". In that state the system generates a set of constraints that pin the view to the position given by `frame`. Those constraints have the highest priority, and any other constraints you write conflict with them.

When you forget the line, the constraints are all correct but the view's position and size don't change, and nothing is printed to the console. A new view's `frame` is 0 × 0, so usually the view simply isn't visible.

Three cases don't need it:

- The view controller's root view `page.view`, and windows. The system positions them; don't change this property on them.
- Views arranged by a [`UIStackView`](ui-stack-view.md). The system sets it to `false` automatically (measured).
- `UILayoutGuide`. It has no `frame` and no such property.


### Creating and activating are two steps

Methods such as `constraintEqualToAnchor()` only create the constraint object. A constraint takes part in layout only after it's activated.

```js
const left = new UIView();
const c = left.heightAnchor.constraintEqualToConstant(44);
console.log(c.isActive);   // false
c.isActive = true;
console.log(c.isActive);   // true
```

**Effect**: The first line prints `false` and the second prints `true`. That a new constraint is inactive by default comes from UIKit's definition and is **not verified in the simulator**.

There are two ways to activate:

| Form | When to use it |
| --- | --- |
| `c.isActive = true` | A single constraint |
| `NSLayoutConstraint.activateConstraints([c1, c2, …])` | Several at once |

Use the batch form when activating several at once. When activating one at a time, the first few are already in effect while the rest aren't yet, and layout passes through a state with incomplete constraints. Batch activation has no such intermediate state.

To deactivate, use `c.isActive = false` or `NSLayoutConstraint.deactivateConstraints([…])`.

**Where constraints are stored.** On activation, the system stores the constraint on the nearest common ancestor of the views at its two ends. You can read it back from that view's `constraints` property:

- A constraint between two subviews is stored on their superview.
- A view's own width or height constraint (to a constant) is stored on the view itself. In the full example, `card.constraints` contains `cardHeight`.

So `view.constraints` is not "every constraint that affects this view". For that, use [`constraintsAffectingLayoutForAxis()`](ui-view/constraintsaffectinglayoutforaxis.md).

**Both ends must be in the same view hierarchy.** When the two views a constraint connects have no common ancestor (for example, one of them hasn't been added with `addSubview` yet), activation throws a `TypeError` whose message starts with `failed to activate constraint:`. So **add the views to the view hierarchy first, then activate the constraints**.


### Missing and conflicting constraints

There are two ways constraints can go wrong, and they behave differently.

| | Missing constraints (ambiguous) | Conflicting constraints |
| --- | --- | --- |
| What it is | Some quantity isn't determined, and several solutions satisfy the constraints | Several required constraints contradict each other and there is no solution |
| Example | Only the left and top edges are given, with no width or height | The same view has both "width = 100" and "width = 200" |
| Behavior | The system picks any solution. The view may have zero size or end up in an unexpected position | The system drops one of the constraints and lays out with the rest |
| How to check | `view.hasAmbiguousLayout` is `true` | There is no direct query. List the related constraints with `constraintsAffectingLayoutForAxis()` and check them yourself |

**The system reports nothing in either case** (measured: nothing on standard output, standard error, or the system log).

A measured example of missing constraints: after deactivating `cardHeight` in the full example, nothing determines the card's height. The system's result is a card 16 pt high with three color blocks 0 high.

Which constraint the system drops in a conflict is **not verified in the simulator**. Don't rely on it.

The most common source of conflicts is forgetting `translatesAutoresizingMaskIntoConstraints = false`.

To decide clearly which constraints give way when they contradict each other, give them different [priorities](#priority).


### Priority

Every constraint has a priority, a number from 1 to 1000 with no unit.

- **1000** (`'required'`) means "must be satisfied". It's the default for new constraints.
- **Below 1000** means "satisfy if possible". The system first satisfies all constraints at 1000, then tries to satisfy the rest from highest to lowest priority. One it can't satisfy doesn't count as a conflict.

So priority has two uses:

- Giving a quantity a "preferred value" that other constraints are allowed to override. See [Limiting minimum and maximum size](../guides/auto-layout.md#limiting-minimum-and-maximum-size).
- Deciding which view gives way when several compete for space. See [Content hugging and compression resistance](#content-hugging-and-compression-resistance).

You can write a priority as a number or as a name, but **it always reads back as a number**. For the seven names and the warning for invalid values, see [`priority`](auto-layout/priority.md).

```js
const cardHeight = new UIView().heightAnchor.constraintEqualToConstant(60);
cardHeight.priority = 'defaultHigh';
console.log(cardHeight.priority);   // 750
cardHeight.priority = 749;
console.log(cardHeight.priority);   // 749
cardHeight.priority = 'required';
```

**Effect**: Prints `750` and `749`. A value such as 749 has no name, so priorities always read back as numbers.



### Intrinsic content size

Some views know how big they should be. That size is called the intrinsic content size:

| View | Intrinsic content size |
| --- | --- |
| [`UILabel`](ui-label.md) | The size of the laid-out text |
| [`UIButton`](ui-button.md) | The size of the title and icon |
| [`UIImageView`](ui-image.md) | The size of the image |
| Plain `UIView` | None. Reads as `(-1, -1)` (measured) |

A view with an intrinsic content size doesn't need width or height constraints, only position. When the text changes, the intrinsic content size changes with it, and the view's size updates on the next layout pass.

The intrinsic content size isn't a hard rule. The system treats it as four constraints with priorities: for width and for height, one "no bigger than this" and one "no smaller than this". Other constraints can override them. The priorities of these four are the subject of the next section.

You can read the intrinsic content size from [`view.intrinsicContentSize`](ui-view/intrinsiccontentsize.md), and tell the system it has changed with [`invalidateIntrinsicContentSize()`](ui-view/invalidateintrinsiccontentsize.md).

### Content hugging and compression resistance

These two priorities express how strongly a view with an intrinsic content size holds on to that size.

| Priority | Meaning | Default |
| --- | --- | --- |
| Content hugging | How strongly the view resists being **stretched larger than its intrinsic size** | 250 |
| Compression resistance | How strongly the view resists being **squeezed smaller than its intrinsic size** | 750 |

They're set separately for the horizontal and vertical axes.

```js
const label = new UILabel();
label.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });
console.log(label.contentHuggingPriorityForAxis('horizontal'));   // 750
```

**Effect**: The priority with which `label` resists being stretched horizontally goes from 250 to 750.

When the total width of a row of views doesn't match the available width:

- **Extra space**: the view with the **lowest** hugging priority is stretched to take up the extra space.
- **Not enough space**: the view with the **lowest** compression resistance priority is squeezed. A text label that is squeezed has its text truncated.

Which view is stretched or squeezed in these two cases is **not verified in the simulator**.

Extra or missing space is **not shared proportionally**; the single view with the lowest priority takes all of it. To have several views share space in proportion, don't use these two priorities; use constraints between `widthAnchor`s with a `multiplier`. See [Two views of equal width](../guides/auto-layout.md#two-views-of-equal-width) and [Half the width of the superview](../guides/auto-layout.md#half-the-superviews-width) in the guide.

When two views have equal priorities, the system can't tell which one to stretch or squeeze; that's a case of [missing constraints](#missing-and-conflicting-constraints). So when placing two labels side by side, change the priority of one of them.

`UILabel` and a plain `UIView` have the same defaults: hugging 250 and compression resistance 750 (measured, both horizontally and vertically). The only difference is that `UILabel` has an intrinsic content size and a plain `UIView` doesn't. For a view without an intrinsic content size, these two priorities have no effect.


### When constraints are resolved

Activating constraints, changing `constant`, and changing priority don't change the view's `frame` right away. The system only notes that layout is needed, and computes everything once, after the current run of JS finishes and before the next screen refresh.

Reading `frame` doesn't trigger the computation. Reading `frame` before the system finishes this layout pass gives the result of the previous pass.

To get the result immediately, call `layoutIfNeeded()`:

```js
const page = new UIViewController();
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(card);
const cardHeight = card.heightAnchor.constraintEqualToConstant(64);
NSLayoutConstraint.activateConstraints([
  card.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
  card.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  card.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
  cardHeight,
]);
page.view.layoutIfNeeded();

cardHeight.constant = 84;
console.log(card.frame.height);   // still the value from before the change
page.view.layoutIfNeeded();
console.log(card.frame.height);   // 84
```

**Effect**: The second line prints `84`. That the first line prints the height from before the change is **not verified in the simulator**.

Call `layoutIfNeeded()` on a **common ancestor**. It lays out that view and its descendants. Calling it on the view controller's root view is recommended, so that every view's `frame` in the view controller is up to date.

Code that only sets up the interface and doesn't read `frame` afterward doesn't need to call it.

## Examples

### A card at the bottom of the screen

The code below starts from a blank app and places a card at the bottom of the screen, with three color blocks laid out in a row inside it. The left and right blocks have fixed widths; the middle one fills the remaining width.

```
safe leading                                          safe trailing
│                                                    │
│<16>┌───────────────── card ─────────────────┐<16>│
│    │<8>┌──────┐<8>┌────────────┐<8>┌──────┐<8>│    │
│    │   │ left │   │   middle   │   │ right│   │    │  card is 60 high
│    │   │  60  │   │    auto    │   │  60  │   │    │  8 above and below each block
│    │   └──────┘   └────────────┘   └──────┘   │    │
│    └──────────────────────────────────────────┘    │
│                        24                          │
└──────────────────── safe bottom ────────────────────┘
```

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Get the safe area layout guide. Aligning the card to it keeps it clear of the notch and the home indicator
  const safe = page.view.safeAreaLayoutGuide;

  // 2. Create the card. Every view positioned with constraints must turn this property off first
  const card = new UIView();
  card.translatesAutoresizingMaskIntoConstraints = false;
  card.backgroundColor = 'secondarySystemBackground';
  page.view.addSubview(card);

  // 3. Create three color blocks and put them in the card
  const left = new UIView();
  const middle = new UIView();
  const right = new UIView();
  const colors = ['systemRed', 'systemOrange', 'systemBlue'];
  [left, middle, right].forEach((v, i) => {
    v.translatesAutoresizingMaskIntoConstraints = false;
    v.backgroundColor = colors[i];
    card.addSubview(v);
  });

  // 4. Write the constraints. This only creates them; they aren't in effect yet
  const cardHeight = card.heightAnchor.constraintEqualToConstant(60);
  const constraints = [
    // Card: 16 from the safe area on the left and right, bottom 24 above the safe area's bottom, 60 high
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

  // 6. Finish layout right away, so the frames read below are the result of the constraints
  page.view.layoutIfNeeded();
  console.log(card.frame.width, card.frame.height);
  console.log(left.frame.width, middle.frame.width, right.frame.width);
});
```

**Effect**

- A light gray card appears at the bottom of the screen, with red, orange, and blue color blocks inside it from left to right.
- The card is as wide as the safe area minus 32 pt, and 60 pt high.
- The left and right blocks are 60 pt wide. The middle block is the card's width minus 152 pt (two 60s and four 8s).
- The three color blocks are 44 pt high (60 minus 8 above and 8 below).
- The console prints two lines of numbers: the values above.

This example has the same layout as the acceptance test, and the sizes above are asserted in the simulator. The acceptance test uses `UIColor` objects for the colors; this example uses strings instead.

Constraints are created from anchors; offsets to the right and downward are positive, so the offset for the card's right edge is `-16`; the middle block has no width, and its left and right edges are determined by the left and right blocks; constraints take effect only once activated. For more patterns, see the guide [Laying out with constraints](../guides/auto-layout.md).

## Corresponding iOS API

Use this table to find the JS form when working from Apple's documentation or iOS sample code.

| ObjC | JS |
| --- | --- |
| `view.translatesAutoresizingMaskIntoConstraints = NO` | `view.translatesAutoresizingMaskIntoConstraints = false` |
| `[a.leadingAnchor constraintEqualToAnchor:b.trailingAnchor]` | `a.leadingAnchor.constraintEqualToAnchor(b.trailingAnchor)` |
| `[a.topAnchor constraintEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintEqualToAnchor(b.bottomAnchor, { constant: 8 })` |
| `[a.topAnchor constraintGreaterThanOrEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintGreaterThanOrEqualToAnchor(b.bottomAnchor, { constant: 8 })` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5 })` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5 constant:-8]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5, constant: -8 })` |
| `[v.widthAnchor constraintEqualToConstant:60]` | `v.widthAnchor.constraintEqualToConstant(60)` |
| `[b.leadingAnchor constraintEqualToSystemSpacingAfterAnchor:a.trailingAnchor multiplier:1]` | `b.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(a.trailingAnchor)` |
| `[a.trailingAnchor anchorWithOffsetToAnchor:b.leadingAnchor]` | `a.trailingAnchor.anchorWithOffsetToAnchor(b.leadingAnchor)` |
| `c.active = YES` | `c.isActive = true` |
| `c.constant = 84` | `c.constant = 84` |
| `[NSLayoutConstraint activateConstraints:@[c1, c2]]` | `NSLayoutConstraint.activateConstraints([c1, c2])` |
| `[NSLayoutConstraint deactivateConstraints:@[c1]]` | `NSLayoutConstraint.deactivateConstraints([c1])` |
| `c.priority = UILayoutPriorityDefaultLow` | `c.priority = 'defaultLow'` |
| `c.relation == NSLayoutRelationEqual` | `c.relation === 'equal'` |
| `[v setContentHuggingPriority:250 forAxis:UILayoutConstraintAxisHorizontal]` | `v.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' })` |
| `[v contentHuggingPriorityForAxis:UILayoutConstraintAxisHorizontal]` | `v.contentHuggingPriorityForAxis('horizontal')` |
| `[v systemLayoutSizeFittingSize:s]` | `v.systemLayoutSizeFittingSize(s)` |
| `[v systemLayoutSizeFittingSize:s withHorizontalFittingPriority:h verticalFittingPriority:p]` | `v.systemLayoutSizeFittingSize(s, { withHorizontalFittingPriority: h, verticalFittingPriority: p })` |
| `[v constraintsAffectingLayoutForAxis:UILayoutConstraintAxisHorizontal]` | `v.constraintsAffectingLayoutForAxis('horizontal')` |
| `[[UILayoutGuide alloc] init]` | `new UILayoutGuide()` |
| `[view addLayoutGuide:guide]` | `view.addLayoutGuide(guide)` |
| `view.safeAreaLayoutGuide` | `view.safeAreaLayoutGuide` |
| `view.keyboardLayoutGuide.topAnchor` | `view.keyboardLayoutGuide.topAnchor` |

Three rules for converting:

- The first part of the ObjC method name is the JS method name, and the remaining parts become keys of an options object: `constraintEqualToAnchor:constant:` becomes `constraintEqualToAnchor(other, { constant })`.
- A boolean property declared with `getter=isActive` in ObjC is called `isActive` in JS.
- Enums and named constants are strings: `UILayoutConstraintAxisHorizontal` becomes `'horizontal'`, and `UILayoutPriorityRequired` becomes `'required'`.

The native `[view addConstraint:c]` and `[view removeConstraint:c]` have no JS counterpart. Use `c.isActive = true` and `c.isActive = false`, which Apple's documentation also recommends.

## Comparison with CSS

This table is only for readers who know CSS and want to look up equivalents; the rest of the page doesn't depend on it.

| CSS | Here | Differences |
| --- | --- | --- |
| `width: 120px` | `widthAnchor.constraintEqualToConstant(120)` | |
| `width: 50%` | `widthAnchor.constraintEqualToAnchor(parent.widthAnchor, { multiplier: 0.5 })` | Can be relative to any view, not just the superview |
| `min-width`, `max-width` | `constraintGreaterThanOrEqualToConstant()`, `constraintLessThanOrEqualToConstant()` | |
| `aspect-ratio: 16 / 9` | `heightAnchor.constraintEqualToAnchor(widthAnchor, { multiplier: 9 / 16 })` | |
| `inline-start`, `inline-end` | `leading`, `trailing` | |
| `env(safe-area-inset-*)` | `safeAreaLayoutGuide` | Gives a rectangle you can align to, not four numbers |
| `flex-grow` | Content hugging priority | Reversed: the lower the value, the more easily the view is stretched. Not shared proportionally; all extra space goes to the lowest one |
| `flex-shrink` | Compression resistance priority | Reversed: the lower the value, the more easily the view is squeezed. Not shared proportionally |
| `flex: 1` | Give this item a lower hugging priority than the others | |
| `align-items: baseline` | Align `firstBaselineAnchor` | |
| Reading `offsetWidth` performs layout automatically | No equivalent. Call `layoutIfNeeded()` first, then read `frame` | |
| Normal flow (items are laid out in order without any rules) | No equivalent. Use [`UIStackView`](ui-stack-view.md) | |

## See also

- [Laying out with constraints](../guides/auto-layout.md): patterns for common layouts and how to debug wrong constraints
- [`NSLayoutAnchor`](ns-layout-anchor.md), [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md), [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md), [`NSLayoutDimension`](ns-layout-dimension.md): the methods that create constraints
- [`UILayoutGuide`](ui-layout-guide.md): an invisible rectangle
- [`UIView`](ui-view.md): the constraint-related members on views
- [`UIStackView`](ui-stack-view.md): arranges views in a row or column without writing constraints yourself
- [`UIScrollView`](ui-scroll-view.md): uses `contentLayoutGuide` and `frameLayoutGuide` to describe the size of the content area
- [`UILabel`](ui-label.md): a view with an intrinsic content size, and the main place hugging and compression resistance priorities are used
- [Enums](enums.md): the general rules for string enums
- [`CGRect`](cg-rect.md), [`CGSize`](cg-size.md)
- [Units](units.md): what a pt is
