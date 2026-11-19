# Building a scrolling view

This guide covers how to use [`UIScrollView`](../api/ui-scroll-view.md) to build a view that scrolls: setting up the structure, finding out why it won't scroll, reading the scroll position, scrolling from code, horizontal scrolling, carousels, and the keyboard. Details of each property, method, and event are on the [`UIScrollView`](../api/ui-scroll-view.md) reference page; for the three concepts of content area, visible area, and offset, see [Three basic concepts](../api/ui-scroll-view.md#three-basic-concepts).

## Recommended approach

For a view that needs to scroll, the recommended structure is **a vertical stack view ([`UIStackView`](../api/ui-stack-view.md)) inside the scroll view, with each block of content as one arranged subview of the stack**. The [complete example](#first-scrolling-view) uses this structure.

The reasons:

- The stack view's height is determined by its content, and the content area's height follows it. Adding, removing, or hiding a block needs no constraint changes and no recalculation of `contentSize`.
- The stack view's width equals the visible area's width, so it scrolls only vertically, and a device with a different width needs no code changes.

There are two ways to place the scroll view itself:

| Approach | Result | Use for |
| --- | --- | --- |
| Align its four edges with the view controller's root view | Content passes under the notch and the home indicator while scrolling. The system automatically adds space above and below the content; see [Safe area](../api/ui-scroll-view.md#safe-area) | Ordinary views |
| Align its four edges with the safe area (`page.view.safeAreaLayoutGuide`) | Content never enters the notch or home indicator area. The system adds no space, and `contentOffset.y` at the very top is `0` | When you need to calculate with `contentOffset` and don't want to deal with the added space |

## Three common reasons it won't scroll

When a scroll view won't scroll, nothing is printed to the console. First call `layoutIfNeeded()` on the view controller's root view, then read `scroller.contentSize` and `scroller.bounds`, and compare against the three cases below:

| `contentSize` reads | Cause | Fix |
| --- | --- | --- |
| `(0, 0)`, and nothing inside is displayed | The container holding the content didn't set `translatesAutoresizingMaskIntoConstraints` to `false` | Add that line for the container. See [Common reason content doesn't show](#content-doesnt-show) |
| `0` in one direction, or doesn't change with the content | Constraints don't pin down the content area's size. Commonly the container is aligned with `contentLayoutGuide` only on the top, left, and right, missing the bottom. **Not verified in the simulator** | Align all four edges of the container with `contentLayoutGuide`, and give the content inside the container a definite height |
| No larger than the width and height of `bounds` | The content simply doesn't extend beyond the visible area | This is normal. To let it be pulled a little anyway, see [Letting little content be pulled](#letting-little-content-be-pulled) |

Also, when `isScrollEnabled` is `false`, the user can't drag it either.

## First scrolling view

The code below starts from a blank app and builds a view that scrolls up and down, with 40 lines of text.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the scroll view, filling the whole view
  const scroller = new UIScrollView();
  scroller.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(scroller);

  // 2. Create a vertical stack and put it in the scroll view
  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;          // 12 pt between lines
  scroller.addSubview(column);

  // 3. Put 40 lines of text in the stack
  for (let i = 1; i <= 40; i++) {
    const label = new UILabel();
    label.text = `Line ${i}`;
    column.addArrangedSubview(label);
  }

  // 4. Use constraints to say how big the scroll view is and how big the content is
  const content = scroller.contentLayoutGuide;
  const frame = scroller.frameLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    // The scroll view's four edges align with the view
    scroller.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
    scroller.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
    scroller.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
    scroller.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
    // The stack's four edges align with the content area: the content is as tall as the stack
    column.topAnchor.constraintEqualToAnchor(content.topAnchor),
    column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
    column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
    column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
    // The stack's width equals the visible area's width: no horizontal scrolling
    column.widthAnchor.constraintEqualToAnchor(frame.widthAnchor),
  ]);
});
```

**Effect**

- "Line 1", "Line 2", … are stacked from top to bottom; 40 lines don't fit on one screen.
- Dragging a finger up and down moves the content. After release, the content keeps gliding a little before stopping.
- At the very top or bottom you can still pull a little further, and it springs back on release.
- A thin indicator appears on the right while scrolling and disappears when it stops.
- It can't be dragged left or right.

This code hasn't been run as a whole in the simulator. The same structure (a vertical stack view inside a scroll view, with the same five constraints between the stack and the two guides) has been run in the acceptance tests, asserting that the content area's height equals the sum of the line heights plus spacing and that its width equals the visible area's width. The dragging, momentum, bounce, and indicator listed above are the system's default behavior, checked by swiping by hand during acceptance.

The four steps are: create the scroll view, create the container for the content, add the content, and use constraints to specify sizes. For the "content area" and "visible area" in step 4, see [Three basic concepts](../api/ui-scroll-view.md#three-basic-concepts).

The lines of text have no constraints of their own; the stack view arranges their positions and sizes. `column` has no height set; its height is the height of 40 lines plus 39 spacings, and the content area's height follows it.

> **Note:** The line `column.translatesAutoresizingMaskIntoConstraints = false` in step 2 can't be left out. For why, see [Common reason content doesn't show](#content-doesnt-show).

The sections below reuse the variables `scroller`, `column`, `page`, `content`, and `frame`. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const scroller = new UIScrollView();
const column = new UIStackView();
column.axis = 'vertical';
scroller.addSubview(column);
page.view.addSubview(scroller);
const content = scroller.contentLayoutGuide;
const frame = scroller.frameLayoutGuide;
```

## Knowing where it has scrolled to

```js
scroller.addEventListener('scroll', () => {
  console.log(scroller.contentOffset.y);
});
```

**Effect**: A number is printed continuously while scrolling. At the very top it is around `0` (negative with a safe area; see [Safe area](../api/ui-scroll-view.md#safe-area)), and it grows the further down you scroll, in [pt](../api/units.md).

User drags, momentum after release, and code writing `contentOffset` all fire `scroll`. Scrolling works as usual when nothing listens for `scroll`.

## Knowing it has reached the bottom

```js
scroller.addEventListener('scroll', () => {
  // Where the bottom of the visible area is now within the content area
  const visibleBottom = scroller.contentOffset.y + scroller.bounds.height
    - scroller.adjustedContentInset.bottom;
  // Within 100 pt of the content area's bottom counts as the bottom
  if (visibleBottom >= scroller.contentSize.height - 100) {
    console.log('Reached the bottom');
  }
});
```

**Effect**: When the content is scrolled to within 100 pt of the bottom, the console prints `Reached the bottom`. It prints again on every `scroll` as scrolling continues, so when using it to trigger "load the next page", keep your own "loading" flag to avoid triggering repeatedly. **Not verified in the simulator.**

`adjustedContentInset.bottom` is subtracted because the system may have added space below the content (see [Safe area](../api/ui-scroll-view.md#safe-area)), and that space isn't content. The margin (100 pt here) starts loading before the user actually sees the bottom.

There is no "scrolled to the bottom" event; you have to check it yourself in `scroll`.

## Scrolling to a position from code

```js
scroller.setContentOffset(new CGPoint(0, 500), { animated: true });
```

**Effect**: The content scrolls smoothly to 500 pt down. When the animation ends, the `scrollanimationend` event fires.

Without animation, assign directly:

```js
scroller.contentOffset = new CGPoint(0, 500);
```

**Effect**: It jumps to that position immediately, with no transition.

## Back to top

```js
const top = -scroller.adjustedContentInset.top;
scroller.setContentOffset(new CGPoint(0, top), { animated: true });
```

**Effect**: It scrolls smoothly back to the very top. **Not verified in the simulator.**

The top isn't necessarily `0`. With a safe area the system adds space above, and the top corresponds to a negative number, so subtract `adjustedContentInset.top`.

## Scrolling a subview onto the screen

```js
const target = column.arrangedSubviews[29];   // Line 30
// Convert target's bounds to a position relative to the content area's top-left corner
const rect = target.convertRect(target.bounds, { toView: scroller });
scroller.scrollRectToVisible(rect, { animated: true });
```

**Effect**: It scrolls the shortest distance so that line 30 appears fully on screen. If it is already fully visible, nothing happens. **Not verified in the simulator.**

The rectangle `scrollRectToVisible()` wants is relative to the content area's top-left corner. When `target` is a direct subview of the scroll view, you can pass `target.frame` directly. Here `target` is inside the stack view, so it is converted with `convertRect()`.

## Switching to horizontal scrolling

Change the direction in step 2 of the [complete example](#first-scrolling-view) to horizontal, and replace the stack's five constraints in step 4 with this set:

```js
column.axis = 'horizontal';

NSLayoutConstraint.activateConstraints([
  // These four are the same as before
  column.topAnchor.constraintEqualToAnchor(content.topAnchor),
  column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
  column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
  column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
  // Previously the width equaled the visible area's width; now the height does
  column.heightAnchor.constraintEqualToAnchor(frame.heightAnchor),
]);
```

**Effect**: Content is laid out from left to right and can be dragged left and right, but not up and down. **Not verified in the simulator.**

The rule: in whichever direction the size equals the visible area, that direction can't scroll.

## Paging one at a time (a carousel)

```js
scroller.isPagingEnabled = true;
```

Combine it with horizontal scrolling, and make each subview as wide as the visible area:

```js
const cards = ['systemRed', 'systemOrange', 'systemBlue'].map((color) => {
  const card = new UIView();
  card.backgroundColor = color;
  return card;
});
for (const card of cards) {
  column.addArrangedSubview(card);
  card.widthAnchor.constraintEqualToAnchor(frame.widthAnchor).isActive = true;
}
```

**Effect**: After each swipe and release, it stops where one card exactly fills the screen, never between two cards.

Calculate the current page when scrolling stops. If the content has already stopped at release, there is no `decelerateend` (**not verified in the simulator**), so listen for both events:

```js
function reportPage() {
  const index = Math.round(scroller.contentOffset.x / scroller.bounds.width);
  console.log('Page', index);   // Starts at 0
}
scroller.addEventListener('decelerateend', reportPage);
scroller.addEventListener('dragend', () => {
  if (!scroller.isDecelerating) reportPage();
});
```

**This carousel example is not verified in the simulator.**

## Knowing when scrolling starts and ends

```js
scroller.addEventListener('dragbegin', () => console.log('Drag began'));
scroller.addEventListener('dragend', () => console.log('Released'));
scroller.addEventListener('decelerateend', () => console.log('Fully stopped'));
```

**Effect**: When the user drags and releases, it prints `Drag began`, `Released`, then `Fully stopped` (the measured order).

If the finger has no velocity at release, the content doesn't keep gliding, so there is no `Fully stopped` (**not verified in the simulator**). To detect this:

```js
scroller.addEventListener('dragend', () => {
  if (!scroller.isDecelerating) console.log('Already stopped on release');
});
```

## Disabling scrolling

```js
scroller.isScrollEnabled = false;
```

**Effect**: The user can't drag it. Writing `contentOffset` from code still works. Set it back to `true` to restore.

## Removing the bounce at the ends

```js
scroller.bounces = false;
```

**Effect**: It stops at the very top or bottom and can't be pulled further.

## Letting little content be pulled

When the content doesn't extend beyond the visible area, it can't be dragged by default. To let it be pulled anyway:

```js
scroller.alwaysBounceVertical = true;
```

**Effect**: When the content is less than one screen, it can still be pulled a little up and down, and springs back on release. **Not verified in the simulator.**

## Hiding the scroll indicator

```js
scroller.showsVerticalScrollIndicator = false;
```

**Effect**: The indicator no longer appears on the right while scrolling. The horizontal counterpart is `showsHorizontalScrollIndicator`.

## Adding space around the content

```js
scroller.contentInset = new UIEdgeInsets(20, 0, 80, 0);   // Top, left, bottom, right
```

**Effect**: The content gets 20 pt of extra space at the top and 80 pt at the bottom, and the space scrolls with the content. When there is a floating button at the bottom, use it to keep the last line from being covered. **Not verified in the simulator.**

All four fields must be given; you can also write a plain object `{ top: 20, left: 0, bottom: 80, right: 0 }`. A missing field throws `TypeError`.

When the content is in a stack view, another approach is to give the stack view [margins](../api/ui-stack-view.md). The difference: the space from `contentInset` isn't counted in `contentSize`, while margins are.

## Keeping the text field visible when the keyboard appears

Constrain the scroll view's bottom edge to the top edge of the view controller's view's `keyboardLayoutGuide`. `keyboardLayoutGuide` is an invisible rectangle the system provides: when the keyboard is hidden, its top edge is at the bottom of the safe area; when the keyboard is shown, its top edge is at the top of the keyboard.

Replace the scroll view's bottom-edge constraint in step 4 of the [complete example](#first-scrolling-view) with:

```js
const keyboardTop = scroller.bottomAnchor.constraintEqualToAnchor(
  page.view.keyboardLayoutGuide.topAnchor);
keyboardTop.isActive = true;

// When the text field gains focus, scroll it into the visible area
const field = new UITextField();
field.placeholder = 'Notes';
column.addArrangedSubview(field);
field.addEventListener('focus', () => {
  const rect = field.convertRect(field.bounds, { toView: scroller });
  scroller.scrollRectToVisible(rect, { animated: true });
});
```

**Effect**: When the keyboard appears, the scroll view's visible area shrinks to above the keyboard, with no content under the keyboard. When the text field gains focus it scrolls into the visible area. When the keyboard hides, the visible area is restored. No keyboard events need to be listened for, and no keyboard height needs to be calculated.

Constraining "a view's bottom edge to the top edge of `keyboardLayoutGuide`" has been asserted in the acceptance tests for its position while the keyboard is hidden. The effect when the keyboard appears and the scrolling into the visible area are **not verified in the simulator**.

For `keyboardLayoutGuide`, see [Auto Layout](../api/ui-keyboard-layout-guide.md); for text fields, see [Building a text field](text-fields.md).

## Dismissing the keyboard when the list is dragged

When a view has a text field, once the keyboard appears it stays on screen until code dismisses it. Set the scroll view's `keyboardDismissMode` to `'onDrag'`, and the keyboard is dismissed as soon as the user drags the content, with no event listeners to write.

Reusing `scroller` and `column` from the [complete example](#first-scrolling-view):

```js
const field = new UITextField();
field.placeholder = 'Search';
field.borderStyle = 'roundedRect';
column.insertArrangedSubview(field, { atIndex: 0 });

scroller.keyboardDismissMode = 'onDrag';
```

**Effect**: Tapping the text field brings up the keyboard. As soon as a finger starts dragging on the scroll view, the keyboard is dismissed, and the text field ends editing and fires `blur`. **Not verified in the simulator**; the acceptance tests verify that this property can be written and read back on a scroll view.

This property dismisses whatever keyboard is currently shown, regardless of whether the text field being edited is a subview of the scroll view.

To have the keyboard slide down gradually with the finger (common in chat views), use `'interactive'`. For all values, see [Keyboard](../api/ui-scroll-view/keyboarddismissmode.md). For other ways to dismiss the keyboard, see [Text fields and the keyboard](text-fields.md#dismissing-the-keyboard).

## Specifying the content size directly, without constraints

When subviews are positioned with `frame`, use `contentSize` to tell the scroll view how big the content is. When the content changes, write `contentSize` again; it doesn't update itself.

```js
const scroller = new UIScrollView();
scroller.frame = new CGRect(0, 0, 400, 800);
scroller.contentSize = new CGSize(400, 3000);
page.view.addSubview(scroller);

const box = new UIView();
box.frame = new CGRect(20, 2500, 100, 100);
box.backgroundColor = 'systemRed';
scroller.addSubview(box);
```

**Effect**: A 400 × 800 pt scrolling area that can scroll down 2200 pt (3000 minus 800). Near the bottom you see a red square. **Not verified in the simulator.**

## Content doesn't show

**Symptom**: Nothing is in the scroll view, `contentSize` reads `(0, 0)`, and the console shows no error.

**Cause**: The container holding the content didn't set `translatesAutoresizingMaskIntoConstraints = false`.

This property defaults to `true`, meaning "position this view by its `frame`". The container's `frame` defaults to 0 × 0, so the system pins it to zero size, and the content area becomes zero too. Every view positioned with constraints needs it set to `false`.

`addArrangedSubview()` sets it automatically for the subviews it adds, but not for the container itself. When the scroll view itself is positioned with constraints, it needs this line too.

This was measured in the simulator: the system prints nothing.


## See also

- [`UIScrollView`](../api/ui-scroll-view.md): all properties, methods, and events
- [`UIStackView`](../api/ui-stack-view.md): the container for the content
- [`UIKeyboardLayoutGuide`](../api/ui-keyboard-layout-guide.md): the area the keyboard occupies
- [Building a text field](text-fields.md): text fields and the keyboard
- [`UICollectionView`](../api/ui-collection-view.md): lists with large amounts of data
