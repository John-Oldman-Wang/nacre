---
type: reference
native: UIStackView
status: partial
---

# `UIStackView`

**`UIStackView`** represents a stack view, a container that arranges the subviews you put in it into a row or a column along one direction and automatically positions and sizes each of them. It displays nothing itself.

The direction is set by [`axis`](ui-stack-view/axis.md): `'horizontal'` makes a row, `'vertical'` makes a column. The spacing between subviews is set by [`spacing`](ui-stack-view/spacing.md), in [pt](units.md), and does not scale with the font size. How space is distributed along the direction of arrangement is set by [`distribution`](ui-stack-view/distribution.md); how items are aligned perpendicular to it is set by [`alignment`](ui-stack-view/alignment.md).

Subviews that take part in the arrangement are called arranged subviews and are added with [`addArrangedSubview()`](ui-stack-view/addarrangedsubview.md). They are arranged in the order they were added. The stack view creates constraints (the position relationships between views in [Auto Layout](auto-layout.md)) for its arranged subviews, so you do not write, and should not write, their positions.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIStackView`

For how to build common layouts with it, see the guide [Arranging views in a row or column](../guides/stack-views.md).

## Constructor

[`UIStackView()`](ui-stack-view/constructor.md)

Creates a stack view, optionally with an initial set of arranged subviews.

## Instance properties

Also inherits the properties of [`UIView`](ui-view.md). The inherited properties commonly used with stack views are `isHidden` (on arranged subviews), `directionalLayoutMargins` (padding), and `translatesAutoresizingMaskIntoConstraints`.

| Property | Description |
| --- | --- |
| [`axis`](ui-stack-view/axis.md) | Row or column |
| [`distribution`](ui-stack-view/distribution.md) | How space along the direction of arrangement is divided |
| [`alignment`](ui-stack-view/alignment.md) | How items are aligned perpendicular to the direction of arrangement |
| [`spacing`](ui-stack-view/spacing.md) | The spacing between adjacent items |
| [`isBaselineRelativeArrangement`](ui-stack-view/isbaselinerelativearrangement.md) | In a vertical arrangement, measures spacing from text baselines |
| [`isLayoutMarginsRelativeArrangement`](ui-stack-view/islayoutmarginsrelativearrangement.md) | Arranges items inside the padding |
| [`arrangedSubviews`](ui-stack-view/arrangedsubviews.md) <small>read-only</small> | All arranged subviews, in order |

## Instance methods

Also inherits the methods of [`UIView`](ui-view.md). Remove an arranged subview with the inherited [`removeFromSuperview()`](ui-view/removefromsuperview.md).

| Method | Description |
| --- | --- |
| [`addArrangedSubview()`](ui-stack-view/addarrangedsubview.md) | Adds to the end of the arrangement |
| [`insertArrangedSubview()`](ui-stack-view/insertarrangedsubview.md) | Inserts at a given position in the arrangement |
| [`removeArrangedSubview()`](ui-stack-view/removearrangedsubview.md) | Removes from the arrangement; the view is still a subview of the stack view |
| [`setCustomSpacing()`](ui-stack-view/setcustomspacing.md) | Sets the spacing after one particular item |
| [`customSpacingAfterView()`](ui-stack-view/customspacingafterview.md) | Reads the custom spacing set after an item |

## Events

`UIStackView` fires no events of its own. [`traitchange`](ui-view/traitchange-event.md), inherited from [`UIView`](ui-view.md), fires as usual.

## Concepts

### Main axis and cross axis

`axis` sets the direction of arrangement, called the main axis. The perpendicular direction is called the cross axis.

| `axis` | Main axis | Cross axis |
| --- | --- | --- |
| `'horizontal'` | Horizontal, left to right | Vertical |
| `'vertical'` | Vertical, top to bottom | Horizontal |

`distribution` and `spacing` control the main axis; `alignment` controls the cross axis.

### Arranged subviews and subviews

A stack view has two lists:

| List | Contents | What the order means |
| --- | --- | --- |
| `subviews` | All subviews. Inherited from [`UIView`](ui-view.md) | Stacking order; later ones cover earlier ones |
| `arrangedSubviews` | The subviews that take part in the arrangement, called arranged subviews. A subset of `subviews` | Arrangement order, left to right or top to bottom |

How each operation affects the two lists:

| Operation | `arrangedSubviews` | `subviews` |
| --- | --- | --- |
| [`stack.addArrangedSubview(view)`](ui-stack-view/addarrangedsubview.md) | Added | Added |
| [`stack.insertArrangedSubview(view, { atIndex })`](ui-stack-view/insertarrangedsubview.md) | Added | Added |
| [`new UIStackView([view])`](ui-stack-view/constructor.md) | Added | Added |
| [`stack.removeArrangedSubview(view)`](ui-stack-view/removearrangedsubview.md) | Removed | Unchanged |
| [`view.removeFromSuperview()`](ui-view/removefromsuperview.md) | Removed | Removed |
| `stack.addSubview(view)` | Unchanged | Added |

So:

- To add an arranged subview, call only `addArrangedSubview()`; you do not also need `addSubview()`.
- To remove an arranged subview, call only `removeFromSuperview()`; you do not also need `removeArrangedSubview()`.
- A view added with `addSubview()` is not an arranged subview, and the stack view does not position it.

### Where an arranged subview's size comes from

The stack view divides space according to each arranged subview's "intrinsic size". The intrinsic size is the size a view calculates from its own content: how long the text is, how wide the text on a button is. When the content changes, the intrinsic size changes, and the stack view rearranges at the next layout pass.

- Views such as [`UILabel`](ui-label.md), [`UIButton`](ui-button.md), and [`UIImageView`](ui-image.md) have an intrinsic size.
- A plain `UIView` has no intrinsic size. As an arranged subview, either the stack view must stretch it (`alignment = 'fill'`, `distribution = 'fillEqually'`), or you must give it a width and height with constraints. With neither, its size is 0 and it cannot be seen.

The stack view does two things to its arranged subviews:

- Sets their `translatesAutoresizingMaskIntoConstraints` to `false`.
- Creates constraints for them. So do not write constraints that determine their position; write only a width or height when needed.

The stack view's own position is not its own business. Like any other view, it is positioned with constraints or `frame`. When it is an arranged subview of another stack view, the outer stack view positions it. In any direction not limited by a constraint, the stack view's size is determined by its arranged subviews.

### It displays nothing itself

A stack view only arranges; it draws nothing itself. Setting `backgroundColor` or `layer.cornerRadius` on it has no visible effect.

For a background color and rounded corners, wrap it in a plain `UIView`; see [Adding a background and rounded corners](../guides/stack-views.md#adding-a-background-color-and-rounded-corners) in the guide.

### The stack view's own position and size

A stack view only manages the arranged subviews inside it, not itself. Its own position must be set with constraints or `frame`, like any other view. When using constraints, set the stack view's own `translatesAutoresizingMaskIntoConstraints` to `false`; it does not do this for itself. Without this line, the whole stack view has size 0, nothing inside it can be seen, and the console prints nothing.

You can leave out the stack view's size. In any direction where no constraint limits the width or height, the stack view's size is determined by its arranged subviews: their sizes plus the spacing. Measured: a vertical stack view with 12 rows, each 36 pt tall, with 6 pt spacing and no height written, has a calculated height of 498 pt (12 × 36 + 11 × 6).

When a stack view is an arranged subview of another stack view, the outer one positions it, and you write nothing.

### Hidden arranged subviews give up their space

Setting an arranged subview's `isHidden` to `true` makes it give up its space, and the other items rearrange automatically. Setting it back to `false` returns it to its original position. Measured: in a row of three equal-width items, after hiding the middle one, the hidden item's width is 0, the other two split the whole row, and there is only one spacing between them. A hidden arranged subview is still in `arrangedSubviews`.

Views not in a stack view do not behave this way; after being hidden they still occupy their original space.

### Only one row or one column

A stack view does not wrap. When a row does not fit, the items are squeezed narrower; they do not wrap to the next line (the squeezing effect is **not verified in the simulator**). When you need multiple rows, JS decides how many items go in each row; see [Arranging in multiple rows](../guides/stack-views.md#multiple-rows) in the guide.

A stack view does not scroll when its content goes past the screen; put it in a [`UIScrollView`](ui-scroll-view.md).

## Examples

### A column with a line of text and a row of color blocks

The following code starts from a blank app and puts a column near the top of the screen: the first item is a line of text, and the second is a row of three equal-width color blocks.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create a vertical stack view with 16 pt between items
  const column = new UIStackView();
  column.axis = 'vertical';
  column.spacing = 16;

  // 2. First item: a line of text
  const title = new UILabel();
  title.text = 'Three equal-width blocks';
  column.addArrangedSubview(title);

  // 3. Second item: a horizontal stack view holding three color blocks
  const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
    const block = new UIView();
    block.backgroundColor = color;
    return block;
  });
  const row = new UIStackView([red, orange, teal]);
  row.axis = 'horizontal';
  row.distribution = 'fillEqually';   // Three equal widths
  row.spacing = 12;                   // 12 pt between items
  column.addArrangedSubview(row);

  // 4. Put the outermost stack view on the page and position it with constraints
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    // The color blocks have no height of their own, so give the row a height
    row.heightAnchor.constraintEqualToConstant(44),
  ]);
});
```

**Effect**

- Near the top of the screen, 16 pt below the top of the safe area, is the line of text "Three equal-width blocks".
- 16 pt below the text is a row of three color blocks: red, orange, teal. Each is 44 pt tall.
- The three blocks have the same width, with 12 pt between each pair. The row is 16 pt from the screen edge on each side.
- Each block's width is (row width − 2 × 12) ÷ 3.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests, and "three equal widths" and the width calculation were checked there.

The four steps are: create the stack view, add the arranged subviews, nest another stack view, and position the outermost one with constraints. For the constraints in step 4 and `safeAreaLayoutGuide` (the safe area, the region of the screen not covered by the notch or the home indicator), see [`NSLayoutConstraint`](auto-layout.md) and [`UIView`](ui-view.md).

> **Note:** The line `column.translatesAutoresizingMaskIntoConstraints = false` in step 4 is required. This property defaults to `true`, meaning "position this view by its `frame`", and a new view's `frame` is 0 × 0, so the whole column would be invisible. The arranged subviews in the stack view (`title`, `row`, and the three blocks) are set automatically by the stack view; you do not write it for them.

This example gives `column` no height and gives `title` no constraints at all. `column`'s height is determined by the heights of its two arranged subviews plus the spacing, and `title`'s height is determined by its text.

For more patterns, see the guide [Arranging views in a row or column](../guides/stack-views.md).

## Corresponding iOS API

Use this table to look up the JS equivalent when following Apple's documentation or iOS sample code.

| ObjC | JS |
| --- | --- |
| `[[UIStackView alloc] init]` | `new UIStackView()` |
| `[[UIStackView alloc] initWithArrangedSubviews:@[a, b]]` | `new UIStackView([a, b])` |
| `stack.axis = UILayoutConstraintAxisVertical` | `stack.axis = 'vertical'` |
| `stack.distribution = UIStackViewDistributionFillEqually` | `stack.distribution = 'fillEqually'` |
| `stack.alignment = UIStackViewAlignmentCenter` | `stack.alignment = 'center'` |
| `stack.alignment = UIStackViewAlignmentTop` | `stack.alignment = 'top'`, which reads back as `'leading'` |
| `stack.spacing = 12` | `stack.spacing = 12` |
| `stack.spacing = UIStackViewSpacingUseSystem` | `stack.spacing = 'system'` |
| `stack.baselineRelativeArrangement = YES` | `stack.isBaselineRelativeArrangement = true` |
| `stack.layoutMarginsRelativeArrangement = YES` | `stack.isLayoutMarginsRelativeArrangement = true` |
| `stack.directionalLayoutMargins = NSDirectionalEdgeInsetsMake(16, 16, 16, 16)` | `stack.directionalLayoutMargins = new NSDirectionalEdgeInsets(16, 16, 16, 16)` |
| `stack.arrangedSubviews` | `stack.arrangedSubviews` |
| `[stack addArrangedSubview:v]` | `stack.addArrangedSubview(v)` |
| `[stack insertArrangedSubview:v atIndex:1]` | `stack.insertArrangedSubview(v, { atIndex: 1 })` |
| `[stack removeArrangedSubview:v]` | `stack.removeArrangedSubview(v)` |
| `[stack setCustomSpacing:40 afterView:v]` | `stack.setCustomSpacing(40, { afterView: v })` |
| `[stack setCustomSpacing:UIStackViewSpacingUseDefault afterView:v]` | `stack.setCustomSpacing('default', { afterView: v })` |
| `[stack customSpacingAfterView:v]` | `stack.customSpacingAfterView(v)` |

The rule for converting enum values: drop the type prefix and lowercase the first letter. `UIStackViewDistributionEqualSpacing` is written `'equalSpacing'`.

## Comparison with CSS

This table is only for people familiar with flexbox to look up equivalents; the rest of the page does not depend on it.

| CSS | `UIStackView` | Difference |
| --- | --- | --- |
| `display: flex` | `new UIStackView()` | Subviews must be added with `addArrangedSubview()` |
| `flex-direction: row` / `column` | `axis = 'horizontal'` / `'vertical'` | |
| `gap` | `spacing` | Only pt or `'system'`; no `em` or percentages |
| `justify-content` plus each item's `flex-grow` | `distribution` | No values corresponding to `center`, `flex-end`, or `space-around` |
| `justify-content: space-between` | `distribution = 'equalSpacing'` | |
| `flex-grow` | The arranged subview's content hugging priority | Works the other way round: the lower the value, the more easily it stretches. Not proportional |
| `align-items: stretch` | `alignment = 'fill'` | |
| `align-items: flex-start` / `center` / `flex-end` | `alignment = 'leading'` / `'center'` / `'trailing'` | |
| `align-items: baseline` | `alignment = 'firstBaseline'` | Only works in a horizontal arrangement |
| `padding` | `directionalLayoutMargins`, with `isLayoutMarginsRelativeArrangement` set to `true` | The default is 8 pt on each edge, not 0 |
| `display: none` | `isHidden = true` on the arranged subview | |
| `flex-wrap` | None | |
| `align-self`, `order` | None | The whole stack view has only one alignment, and the order is the order of adding |
| The container's own `background`, `border-radius` | Not displayed | Wrap it in a plain view |

## See also

- [Arranging views in a row or column](../guides/stack-views.md): equal widths, filling remaining space, alignment, hiding, padding, background, nesting
- [`UIView`](ui-view.md): the inherited members; `isHidden`, `removeFromSuperview()`, and content priorities are all there
- [`NSLayoutConstraint`](auto-layout.md): positioning the stack view itself needs constraints
- [`UIScrollView`](ui-scroll-view.md): put the stack view in one when its content goes past the screen
- [`UILabel`](ui-label.md): the most common arranged subview; it has an intrinsic size
- [Enums](enums.md): the general rules for string values and the format of warnings and errors for invalid values
- [Units](units.md): what pt is
