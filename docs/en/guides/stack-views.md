# Arranging views in a row or column

This guide shows how to use [`UIStackView`](../api/ui-stack-view.md) to arrange a group of views in a row or column: dividing space equally, letting one item fill the remaining space, alignment, hiding, inserting and removing, padding, background color and rounded corners, and nesting to make multiple rows. The details of each property and method are on the [`UIStackView`](../api/ui-stack-view.md) reference page.

## Recommended approach

- **Build the body of a view controller as "a vertical stack view inside a scroll view".** Each block of content on the screen is one arranged subview; the content can scroll when it extends past the screen, and adding or removing content doesn't require changing any constraints. For the full code, see [the complete `UIScrollView` example](scrolling.md#first-scrolling-view).
- **Add with `addArrangedSubview()` and remove with `removeFromSuperview()`.** Views added with `addSubview()` aren't arranged; after `removeArrangedSubview()` takes a view out of the arrangement, the view still stays in the container. See [Arranged subviews and subviews](../api/ui-stack-view.md#arranged-subviews-and-subviews).
- **Use `isHidden` for items that are temporarily not shown; don't remove them and add them back.** A hidden item keeps its place in the order, and returns to the same position when shown again.
- **Use padding for space around the edges; don't wrap things in an extra view.** See [Adding padding to the container](#adding-padding-to-the-container).
- **Set background color and rounded corners on an outer plain view.** A stack view's own background color and rounded corners aren't displayed; see [Adding a background color and rounded corners](#adding-a-background-color-and-rounded-corners).

## First example

The code below starts from a blank app and places a column near the top of the screen: the first item is a line of text, and the second is a row of three equal-width color blocks.

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
  row.distribution = 'fillEqually';   // the three items are equally wide
  row.spacing = 12;                   // 12 pt between items
  column.addArrangedSubview(row);

  // 4. Put the outermost container in the view controller and position it with constraints
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
- 16 pt below the text is a row of three color blocks: red, orange, and teal. Each is 44 pt high.
- The three blocks are equally wide, with 12 pt between each pair. The row is 16 pt from the screen edge on each side.
- Each block's width is (row width − 2 × 12) ÷ 3.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests, and "three equal-width items" and the width calculation are checked in the acceptance tests.

The four steps are: create the container, add the arranged subviews, nest another container, and position the outermost one with constraints. For the constraints in step 4 and `safeAreaLayoutGuide` (the safe area: the part of the screen not covered by the notch and the home indicator), see the guide [Laying out with constraints](auto-layout.md) and [`UIView`](../api/ui-view.md).

> **Note:** The line `column.translatesAutoresizingMaskIntoConstraints = false` in step 4 is required. The property defaults to `true`, meaning "position this view by its `frame`", and a new view's `frame` is 0 × 0, so the whole column would be invisible. Arranged subviews placed in the container (`title`, `row`, and the three color blocks) are set up by the container automatically, so you don't need to write it for them.

This example gives `column` no height and gives `title` no constraints at all. The height of `column` comes from the heights of its two arranged subviews plus the spacing, and the height of `title` comes from its text.

The sections below reuse `page`, `column`, `row`, and the three color blocks `red`, `orange`, and `teal` from here. To try a section on its own, start with these lines:

```js
const page = new UIViewController();
const column = new UIStackView();
column.axis = 'vertical';
page.view.addSubview(column);
const red = new UIView();
const orange = new UIView();
const teal = new UIView();
const row = new UIStackView([red, orange, teal]);
row.distribution = 'fillEqually';
column.addArrangedSubview(row);
```

## Positioning the container

A stack view manages only its arranged subviews, not itself. The recommended approach is to determine only the container's position and its size perpendicular to the arrangement direction (the left and right edges for a vertical container; the top and bottom edges or the height for a horizontal one), and leave its size along the arrangement direction to its content. When positioning it with constraints, don't forget `translatesAutoresizingMaskIntoConstraints = false` on the container itself.

When a container is an arranged subview of another container, the outer container positions it, and you don't need to write anything.

## A vertical column

```js
const list = new UIStackView();
list.axis = 'vertical';

for (const text of ['First line', 'Second line', 'Third line']) {
  const label = new UILabel();
  label.text = text;
  list.addArrangedSubview(label);
}

column.addArrangedSubview(list);
```

**Effect**: Three lines of text arranged top to bottom, each as wide as the container, with no space between lines.

`axis` is `'horizontal'` when not set, so a vertical arrangement needs this line.

## A horizontal row

```js
const line = new UIStackView();   // axis defaults to 'horizontal'

for (const text of ['Left', 'Middle', 'Right']) {
  const label = new UILabel();
  label.text = text;
  line.addArrangedSubview(label);
}

column.addArrangedSubview(line);
```

**Effect**: Three pieces of text laid out left to right on the same line. **Not verified in the simulator.**

The row is wider than the three pieces of text put together. For which item gets the extra width, see [Letting one item fill the remaining space](#letting-one-item-fill-the-remaining-space).

## Setting the spacing

```js
row.spacing = 24;
```

**Effect**: The gap between each pair of color blocks becomes 24 pt; the three blocks stay equally wide and each gets narrower.

Spacing is added only between adjacent items, not before the first item or after the last.

## Dividing the space equally

```js
row.distribution = 'fillEqually';
```

**Effect**: All arranged subviews are equally wide. Each item's width is (container width − spacing × (number of items − 1)) ÷ number of items.

A vertical container uses the same value, and all items become equally tall.

## Letting one item fill the remaining space

Lay out two pieces of text horizontally, with the left one filling the remaining width and the right one taking only the width of its own text:

```js
const caption = new UILabel();
caption.text = 'Account balance';
const amount = new UILabel();
amount.text = '128.00';

const balance = new UIStackView([caption, amount]);
balance.spacing = 8;

// Make amount hold on to its width more strongly, so all the extra width goes to caption
amount.setContentHuggingPriority('defaultHigh', { forAxis: 'horizontal' });

column.addArrangedSubview(balance);
```

**Effect**: "128.00" sits against the right end of the row, exactly as wide as its text. "Account balance" fills the rest of the width on the left. **Not verified in the simulator.**

When `distribution` is `'fill'` (the default), the container uses each item's content hugging priority to decide who gets the extra space. The content hugging priority is a number from 1 to 1000 that expresses how strongly a view resists being stretched larger than its content. The item with the lowest priority is stretched and gets all the extra space; it isn't shared proportionally. Both `UILabel` and a plain `UIView` default to 250 (measured), so you need to raise or lower one of the items to set an order. For the full description, see [`setContentHuggingPriority()`](../api/ui-view/setcontenthuggingpriority.md).

## Alignment on the cross axis

The three color blocks have different heights; center them vertically in the row:

```js
row.alignment = 'center';

NSLayoutConstraint.activateConstraints([
  red.heightAnchor.constraintEqualToConstant(20),
  orange.heightAnchor.constraintEqualToConstant(44),
  teal.heightAnchor.constraintEqualToConstant(32),
]);
```

**Effect**: The three color blocks are 20, 44, and 32 pt high, with their center lines on the same horizontal line. **Not verified in the simulator.**

`alignment` defaults to `'fill'`, which stretches every item to the container's height. With any other value, each item is shown at its own height, so the color blocks need heights as above. Text and buttons have their own height and don't need one.

For all values, see [`alignment`](../api/ui-stack-view/alignment.md).

## Hiding an item so the rest close the gap

```js
orange.isHidden = true;
page.view.layoutIfNeeded();   // finish layout right away, so the new width can be read below

console.log(orange.frame.width);              // 0
console.log(row.arrangedSubviews.length);     // 3
```

**Effect**

- The orange block isn't shown, and its width becomes 0.
- The red and teal blocks split the row equally, with just one 12 pt gap between them.
- The orange block is still in `arrangedSubviews`; the count doesn't change.

```js
orange.isHidden = false;
```

**Effect**: The orange block returns to its original position, and the three items are equally wide again.

A view that isn't in a stack view keeps occupying its space after it's hidden. Only arranged subviews give up their space when hidden.

Hiding is the recommended way to take an item out temporarily. A hidden item stays in the arrangement in the same order, so showing it again doesn't require working out where to insert it.

## Inserting at a given position

```js
const purple = new UIView();
purple.backgroundColor = 'systemPurple';

row.insertArrangedSubview(purple, { atIndex: 1 });
```

**Effect**: The purple block comes second, making the order red, purple, orange, teal, with all four items equally wide.

`atIndex` starts at 0. It can equal the current number of items, which has the same effect as `addArrangedSubview()`: adding at the end. Out of range, omitted, or `undefined` throws a `TypeError` and nothing is inserted; see [`insertArrangedSubview()`](../api/ui-stack-view/insertarrangedsubview.md).

## Removing an item

```js
orange.removeFromSuperview();

console.log(row.arrangedSubviews.length);   // 2
console.log(orange.superview);              // null
```

**Effect**: The orange block disappears from the screen, and the red and teal blocks split the row equally.

> **Note:** Don't use `removeArrangedSubview()` to remove an item. It only stops the item from being arranged; the view is still a subview of the container and still shown on screen.

```js
row.removeArrangedSubview(orange);

console.log(row.arrangedSubviews.length);   // 2
console.log(orange.superview === row);      // true
console.log(row.subviews.length);           // 3
```

**Effect**: The red and teal blocks split the row equally. The orange block is still in the view hierarchy, but the container no longer positions it. **Where the orange block is shown at this point is not verified in the simulator.**

For the difference between the two, see [Arranged subviews and subviews](../api/ui-stack-view.md#arranged-subviews-and-subviews).

## Extra spacing after a single item

```js
row.setCustomSpacing(40, { afterView: red });

console.log(row.customSpacingAfterView(red));   // 40
```

**Effect**: The gap between the red and orange blocks is 40 pt. The gap between the orange and teal blocks is still the value of `spacing`.

To undo this individual setting:

```js
row.setCustomSpacing('default', { afterView: red });
```

**Effect**: The spacing after the red block goes back to the value of `spacing`.

## Using the system's recommended spacing

```js
row.spacing = 'system';

console.log(row.spacing);   // 'system'
```

**Effect**: The system decides the spacing. It reads back as the string `'system'`; the actual number of points can't be read. **How large the spacing is on screen is not verified in the simulator.**

You can also use system spacing after a single item:

```js
row.setCustomSpacing('system', { afterView: red });
```

## Multiple rows

A stack view arranges only one row or one column and doesn't wrap: when a row runs out of room, the items are squeezed narrower (the squeezing is **not verified in the simulator**). For multiple rows, JS decides how many items go in each row: create one horizontal container per row, then put those horizontal containers in a vertical container. A stack view is itself a view, so it can be an arranged subview of another container.

The code below adds a column at the end of `row`, with one color block above another:

```js
const top = new UIView();
top.backgroundColor = 'systemIndigo';
const bottom = new UIView();
bottom.backgroundColor = 'systemPink';

const stacked = new UIStackView([top, bottom]);
stacked.axis = 'vertical';
stacked.distribution = 'fillEqually';
stacked.spacing = 4;

row.addArrangedSubview(stacked);
```

**Effect**

- `row` has four items, all equally wide.
- The fourth item is as tall as the row (44 pt) and contains two color blocks, one above the other, each 20 pt high with 4 pt between them.

> **Note:** Each nested row computes its widths independently; the second item of the second row has nothing to do with the second item of the first row. When the rows have the same number of items and the same spacing and all use `'fillEqually'`, they compute the same widths. In other cases, to line up columns, use constraints to make the views in the same column equally wide; see [Laying out with constraints](auto-layout.md).

## Adding padding to the container

Padding is the space left between the container's four edges and its arranged subviews, in [pt](../api/units.md). It takes two properties: `directionalLayoutMargins` gives how much to leave on each of the four edges, and `isLayoutMarginsRelativeArrangement` makes the arranged subviews inset by it.

```js
const padded = new UIStackView();
padded.axis = 'vertical';
padded.spacing = 8;
padded.isLayoutMarginsRelativeArrangement = true;
padded.directionalLayoutMargins = { top: 16, leading: 16, bottom: 16, trailing: 16 };

for (const text of ['Title', 'Description']) {
  const label = new UILabel();
  label.text = text;
  padded.addArrangedSubview(label);
}

column.addArrangedSubview(padded);
```

**Effect**: Two lines of text, 16 pt from each of the container's four edges.

This code hasn't been run in the simulator. "Arranged subviews are inset by the padding" is checked in the acceptance tests: in a 200 × 100 pt container with padding of 10 top, 20 leading, 30 bottom, and 40 trailing pt, the arranged subview is at (20, 10) with a size of 140 × 60 pt.

- Both properties are required. If you set only `directionalLayoutMargins` without turning on `isLayoutMarginsRelativeArrangement`, the arranged subviews still sit against the container's edges.
- `leading` is the side where text starts, and `trailing` is the side where it ends. In both Chinese and English, `leading` is on the left.
- The padding defaults to 8 pt on each side, not 0. Turning on the switch without setting the padding uses this default.
- `directionalLayoutMargins` is inherited from `UIView`; for the full description, see [`directionalLayoutMargins`](../api/ui-view/directionallayoutmargins.md). All four fields are required; leaving one out throws `TypeError`.
- To leave space only on the top and bottom, or only on the sides, write `0` for the other two.

> **Note:** When an edge of the container extends outside the safe area (for example, when the container fills the whole screen), the system adds the safe area to that edge's padding. To get exactly the padding you set, set the container's `insetsLayoutMarginsFromSafeArea` to `false`.

## Adding a background color and rounded corners

A stack view's own background color and rounded corners aren't displayed. Instead, wrap it in a plain view: set the background color and rounded corners on the outer view, align the container's four edges to the outer view, and set the padding on the container.

```js
const card = new UIView();
card.backgroundColor = 'secondarySystemBackground';
card.layer.cornerRadius = 12;

const content = new UIStackView();
content.axis = 'vertical';
content.spacing = 8;
content.isLayoutMarginsRelativeArrangement = true;
content.directionalLayoutMargins = { top: 16, leading: 16, bottom: 16, trailing: 16 };
content.translatesAutoresizingMaskIntoConstraints = false;
card.addSubview(content);

for (const text of ['Title', 'Description']) {
  const label = new UILabel();
  label.text = text;
  content.addArrangedSubview(label);
}

// Align the container's four edges with the outer view
NSLayoutConstraint.activateConstraints([
  content.topAnchor.constraintEqualToAnchor(card.topAnchor),
  content.bottomAnchor.constraintEqualToAnchor(card.bottomAnchor),
  content.leadingAnchor.constraintEqualToAnchor(card.leadingAnchor),
  content.trailingAnchor.constraintEqualToAnchor(card.trailingAnchor),
]);

column.addArrangedSubview(card);
```

**Effect**: A light gray rounded rectangle with a corner radius of 12 pt. Inside are two lines of text, 16 pt from each of the rectangle's four edges. **Not verified in the simulator.**

## Scrolling when there's too much content

A stack view doesn't scroll. When the content extends past the screen, put it in a [`UIScrollView`](../api/ui-scroll-view.md). For the full code, see [the complete `UIScrollView` example](scrolling.md#first-scrolling-view), which is exactly a vertical stack view inside a scroll view.

## See also

- [`UIStackView`](../api/ui-stack-view.md): all members
- [`UIView`](../api/ui-view.md): `isHidden`, `removeFromSuperview()`, padding, content priorities
- [Laying out with constraints](auto-layout.md): positioning the container itself
- [`UIScrollView`](../api/ui-scroll-view.md): for content that extends past the screen
