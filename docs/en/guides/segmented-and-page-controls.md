# Building segmented controls and page indicators

This guide covers common uses of two controls: [`UISegmentedControl`](../api/ui-segmented-control.md) (a segmented control, for switching between several side-by-side options) and [`UIPageControl`](../api/ui-page-control.md) (a page indicator, a row of small dots showing how many pages there are and which one is current). Details of each property and method are on their reference pages.

## Recommended approach

- **Write [`selectedSegmentIndex`](../api/ui-segmented-control/selectedsegmentindex.md) right after creating a segmented control.** A newly created one has no selected segment, so the user can't tell which option is current.
- **Listen for [`change`](../api/ui-control/change-event.md) and read the current value in the callback.** For a segmented control, read `selectedSegmentIndex`; for a page control, read `currentPage`. Changing these two values from code doesn't fire `change`, so syncing them elsewhere doesn't trigger the callback.
- **The page control doesn't turn pages for you.** When the content changes page, write `currentPage` in the scroll view's event; when the user taps the page control, scroll the content in `change`. You need to write both directions.
- **To switch between several full screens, use a tab bar, not a segmented control.** See [`UITabBarController`](../api/ui-tab-bar-controller.md).

## First segmented control

Starting from a blank app, place a "Day / Week / Month" segmented control, with a label below showing which segment is selected.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const titles = ['Day', 'Week', 'Month'];
  const seg = new UISegmentedControl(titles);
  seg.selectedSegmentIndex = 0;

  const label = new UILabel();
  label.text = 'By Day';

  seg.addEventListener('change', () => {
    label.text = 'By ' + titles[seg.selectedSegmentIndex];
  });

  const column = new UIStackView([seg, label]);
  column.axis = 'vertical';
  column.spacing = 12;
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  ]);
});
```

**Effect** (not verified in the simulator)

- A segmented control spanning the screen appears near the top, with three equal-width segments and "Day" shown as selected. Below it is "By Day".
- Tap "Week", and the label changes to "By Week".
- Tapping the already selected "Week" again does nothing.

The sections below on segmented controls use a newly created `seg`:

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.selectedSegmentIndex = 0;
```

**Effect**: A three-segment control with segment 0 selected, not yet added to a page.

## Using an image as a segment

In the array passed to the constructor, titles and images can be mixed.

```js
const list = UIImage.systemImageNamed('list.bullet');
const grid = UIImage.systemImageNamed('square.grid.2x2');
if (list !== null && grid !== null) {
  const viewMode = new UISegmentedControl([list, grid]);
  viewMode.selectedSegmentIndex = 0;
}
```

**Effect** (not verified in the simulator): Two segments, one a list icon and one a grid icon.

`systemImageNamed` gets an SF Symbol, the system's built-in set of icons; see [`UIImage`](../api/ui-image.md). It returns `null` when the name doesn't exist, and putting `null` in the array throws, so check for `null` first.

A segment is either a title or an image. Setting a title on an image segment removes its image, and vice versa.

## Deselecting

```js
seg.selectedSegmentIndex = -1;
```

**Effect** (not verified in the simulator): No segment is shown as selected.

## Adding and removing segments at runtime

```js
seg.insertSegmentWithTitle('Year', { atIndex: 3, animated: true });
console.log(seg.numberOfSegments);
seg.removeSegmentAtIndex(0, { animated: true });
console.log(seg.titleForSegmentAtIndex(0));
```

**Effect**: Prints `4`, then `Week`. On screen, "Year" appears at the far right, then "Day" at the far left disappears, with animation (the animation is not verified in the simulator).

The number of segments has already changed when the call returns; you don't need to wait for the animation to finish. Inserting and removing shift the indexes of the segments after them; `selectedSegmentIndex` follows and still points to the segment that was selected. When the removed segment is the selected one, `selectedSegmentIndex` becomes -1.

## Changing a segment's title

```js
seg.setTitle('This week', { forSegmentAtIndex: 1 });
console.log(seg.titleForSegmentAtIndex(1));
```

**Effect**: Prints `This week`.

## Disabling a segment

```js
seg.setEnabled(false, { forSegmentAtIndex: 2 });
```

**Effect** (not verified in the simulator): Segment 2 fades and tapping it does nothing. The other segments work as usual.

To make the whole control untappable, write `seg.isEnabled = false`.

## Using it as a row of buttons

```js
seg.isMomentary = true;
seg.addEventListener('change', () => {
  console.log('Tapped segment', seg.selectedSegmentIndex);
});
```

**Effect** (not verified in the simulator): Tapping a segment makes it flash without staying selected, and the console prints which segment was tapped. Tapping the same segment repeatedly prints each time.

## Sizing segments to their content

```js
seg.apportionsSegmentWidthsByContent = true;
```

**Effect** (not verified in the simulator): Segments with longer titles are wider and segments with shorter titles narrower, instead of equal widths.

To set the width of a specific segment, use `setWidth()`:

```js
seg.setWidth(120, { forSegmentAtIndex: 0 });
```

**Effect** (not verified in the simulator): Segment 0 is 120 pt wide, and the other segments split the remaining width.

## First page control

Starting from a blank app, build three horizontally paged pages with a page control below them.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const colors = ['systemRed', 'systemGreen', 'systemBlue'];
  const width = 300;
  const height = 200;

  // 1. Horizontally scrolling content: three pages, one block of color each
  const scroller = new UIScrollView();
  scroller.frame = new CGRect(40, 100, width, height);
  scroller.isPagingEnabled = true;
  scroller.contentSize = new CGSize(width * colors.length, height);
  colors.forEach((color, i) => {
    const block = new UIView();
    block.frame = new CGRect(width * i, 0, width, height);
    block.backgroundColor = color;
    scroller.addSubview(block);
  });
  page.view.addSubview(scroller);

  // 2. Page control: three pages, dark dots
  const dots = new UIPageControl();
  dots.numberOfPages = colors.length;
  dots.pageIndicatorTintColor = 'tertiaryLabel';
  dots.currentPageIndicatorTintColor = 'label';
  const size = dots.sizeForNumberOfPages(colors.length);
  dots.frame = new CGRect(40 + (width - size.width) / 2, 310, size.width, size.height);
  page.view.addSubview(dots);

  // 3. When the content reaches a page, the page control follows
  scroller.addEventListener('scroll', () => {
    dots.currentPage = Math.round(scroller.contentOffset.x / width);
  });

  // 4. When the page control is tapped, the content scrolls there
  dots.addEventListener('change', () => {
    scroller.setContentOffset(new CGPoint(width * dots.currentPage, 0), { animated: true });
  });
});
```

**Effect** (not verified in the simulator)

- The screen shows a red block with three small dots below it; the first is darkest.
- Swipe the red block left to reveal green; the second dot becomes the darkest.
- Tap the dot on the right, and the content scrolls to the next page.
- Press and drag along the dots, and the content changes page by page.

Writing `currentPage` in step 3 doesn't fire `change`, so the callback in step 4 isn't triggered by scrolling the content.

The sections below on page controls use a newly created `pages`:

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
```

**Effect**: A five-page page control, not yet added to a page.

## Changing colors

The dots are light by default and hard to see on a white background.

```js
pages.pageIndicatorTintColor = '#C7C7CC';
pages.currentPageIndicatorTintColor = '#007AFF';
```

**Effect** (not verified in the simulator): The dots that aren't the current page are light gray, and the current page's dot is blue.

Writing `null` to either property returns to the system default color. For how to write colors, see [Colors](../api/ui-color.md).

## Adding a background behind the dots

```js
pages.backgroundStyle = 'prominent';
```

**Effect** (not verified in the simulator): There is always a semi-transparent rounded background behind the dots, so they are legible on content of any color.

The default, `'automatic'`, has no background normally; it appears only when a finger presses on the dots.

## Replacing dots with images

```js
pages.preferredIndicatorImage = UIImage.systemImageNamed('star');
pages.preferredCurrentPageIndicatorImage = UIImage.systemImageNamed('star.fill');
```

**Effect** (not verified in the simulator): Each page is an outlined star, and the current page is a filled star.

To change only one page, for example to show page 0 as a location arrow:

```js
pages.setIndicatorImage(UIImage.systemImageNamed('location.fill'), { forPage: 0 });
```

**Effect** (not verified in the simulator): Page 0's dot is an arrow; the other dots are unchanged.

After `numberOfPages` is reduced, images set separately on the removed pages are not kept; if it is increased again, those pages return to the default dot.

## Hiding with a single page

```js
pages.hidesForSinglePage = true;
pages.numberOfPages = 1;
```

**Effect** (not verified in the simulator): The page control isn't shown. Change `numberOfPages` to 2 and it reappears.

## Vertical layout

```js
pages.direction = 'topToBottom';
const tall = pages.sizeForNumberOfPages(pages.numberOfPages);
pages.frame = new CGRect(0, 0, tall.width, tall.height);
```

**Effect** (not verified in the simulator): The dots are arranged in a column from top to bottom, with page 0 at the top.

With vertical layout, the size given by `sizeForNumberOfPages()` also becomes narrow and tall, so use it to set `frame` again.

## Preventing drag-to-page

```js
pages.allowsContinuousInteraction = false;
```

**Effect** (not verified in the simulator): Pressing and dragging along the dots does nothing. A tap still turns to the adjacent page.

## See also

- [`UISegmentedControl`](../api/ui-segmented-control.md): all properties and methods of segmented controls
- [`UIPageControl`](../api/ui-page-control.md): all properties and methods of page controls
- [`UIScrollView`](../api/ui-scroll-view.md): horizontally paged content
- [`UIControl`](../api/ui-control.md): control events and disabling
