---
type: reference
native: UIPageControl
status: partial
---

# `UIPageControl`

**`UIPageControl`** represents a page indicator: a row of small dots, one per page, with the dot for the current page brighter. It is used where content is split into pages viewed one at a time, such as onboarding screens or horizontally paged images, to tell the user how many pages there are and which one they are on.

Read and write the number of pages with [`numberOfPages`](ui-page-control/numberofpages.md), and the current page with [`currentPage`](ui-page-control/currentpage.md), counting from 0. A newly created page control has 0 pages and displays nothing.

The page control only shows the page number; it doesn't turn pages. There is no automatic connection between it and the view showing the content (usually a [`UIScrollView`](ui-scroll-view.md)); your code connects both directions:

- The user swipes the content to another page: compute the page number in the scroll view's event and write `currentPage`.
- The user taps a dot, or presses and drags along the row of dots: the control changes `currentPage` itself and fires [`change`](ui-control/change-event.md); in the callback, scroll the content to that page.

Writing `currentPage` from code doesn't fire `change`, so the two directions don't trigger each other.

The control's size is computed automatically from the number of pages; read it with [`sizeForNumberOfPages()`](ui-page-control/sizefornumberofpages.md). The dots are light by default and hard to see on a white background; you can change their colors or add a background.

A page control is a [control](ui-control.md): enabling, state, and events come from `UIControl`. A control is in turn a [view](ui-view.md): position, size, and background color come from `UIView`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIPageControl`

For how to connect it to horizontally paged content and how to change colors and images, see the guide [Building segmented controls and page indicators](../guides/segmented-and-page-controls.md).

## Constructor

[`UIPageControl()`](ui-page-control/constructor.md)

Creates a page control with 0 pages.

## Instance properties

Also inherits properties from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). Inherited properties commonly used with page controls are `frame` and `isEnabled`.

| Property | Description |
| --- | --- |
| [`numberOfPages`](ui-page-control/numberofpages.md) | How many pages there are |
| [`currentPage`](ui-page-control/currentpage.md) | Which page is current |
| [`hidesForSinglePage`](ui-page-control/hidesforsinglepage.md) | Whether it is hidden when there is only one page |
| [`allowsContinuousInteraction`](ui-page-control/allowscontinuousinteraction.md) | Whether the user can press and drag along the dots to turn pages |
| [`backgroundStyle`](ui-page-control/backgroundstyle.md) | When the background behind the dots is shown |
| [`direction`](ui-page-control/direction.md) | Which direction the dots are laid out in |
| [`interactionState`](ui-page-control/interactionstate.md) <small>read-only</small> | Whether the most recent page change was a tap or a drag |
| [`pageIndicatorTintColor`](ui-page-control/pageindicatortintcolor.md) | The color of the dots that aren't the current page |
| [`currentPageIndicatorTintColor`](ui-page-control/currentpageindicatortintcolor.md) | The color of the current page's dot |
| [`preferredIndicatorImage`](ui-page-control/preferredindicatorimage.md) | The image used for all dots |
| [`preferredCurrentPageIndicatorImage`](ui-page-control/preferredcurrentpageindicatorimage.md) | The image used for the current page's dot |

## Instance methods

Also inherits methods from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md).

Changing the image for a single page:

| Method | Description |
| --- | --- |
| [`setIndicatorImage()`](ui-page-control/setindicatorimage.md) | Sets the image for one page's dot |
| [`indicatorImageForPage()`](ui-page-control/indicatorimageforpage.md) | Reads the image set separately for one page |
| [`setCurrentPageIndicatorImage()`](ui-page-control/setcurrentpageindicatorimage.md) | Sets the image used when one page is current |
| [`currentPageIndicatorImageForPage()`](ui-page-control/currentpageindicatorimageforpage.md) | Reads the image used when one page is current |

Size:

| Method | Description |
| --- | --- |
| [`sizeForNumberOfPages()`](ui-page-control/sizefornumberofpages.md) | The minimum size needed to show a given number of pages |

## Events

All events are inherited from [`UIControl`](ui-control.md); listen with `addEventListener()`. The one a page control uses is:

| Event | When it fires |
| --- | --- |
| [`change`](ui-control/change-event.md) | The user tapped or dragged along the dots and changed the page |

## Examples

### Three horizontal pages

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

  // Horizontally scrolling content: three pages, one block of color each
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

  // Page control: three pages, dark dots
  const pages = new UIPageControl();
  pages.numberOfPages = colors.length;
  pages.pageIndicatorTintColor = 'tertiaryLabel';
  pages.currentPageIndicatorTintColor = 'label';
  const size = pages.sizeForNumberOfPages(colors.length);
  pages.frame = new CGRect(40 + (width - size.width) / 2, 310, size.width, size.height);
  page.view.addSubview(pages);

  // When the content reaches a page, the page control follows
  scroller.addEventListener('scroll', () => {
    pages.currentPage = Math.round(scroller.contentOffset.x / width);
  });

  // When the page control is tapped, the content scrolls there
  pages.addEventListener('change', () => {
    scroller.setContentOffset(new CGPoint(width * pages.currentPage, 0), { animated: true });
  });
});
```

**Effect** (not verified in the simulator)

- The screen shows a red block with three small dots below it; the first is darkest.
- Swipe the red block left to reveal green; the second dot becomes the darkest.
- Tap the dot on the right, and the content scrolls to the next page.
- Press and drag along the dots, and the content changes page by page.

For more patterns, see the guide [Building segmented controls and page indicators](../guides/segmented-and-page-controls.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIPageControl alloc] init]` | `new UIPageControl()` |
| `pages.numberOfPages = 3` | `pages.numberOfPages = 3` |
| `pages.currentPage = 1` | `pages.currentPage = 1` |
| `pages.backgroundStyle = UIPageControlBackgroundStyleProminent` | `pages.backgroundStyle = 'prominent'` |
| `pages.direction = UIPageControlDirectionTopToBottom` | `pages.direction = 'topToBottom'` |
| `[pages setIndicatorImage:image forPage:0]` | `pages.setIndicatorImage(image, { forPage: 0 })` |
| `[pages indicatorImageForPage:0]` | `pages.indicatorImageForPage(0)` |
| `[pages sizeForNumberOfPages:3]` | `pages.sizeForNumberOfPages(3)` |
| `[pages addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `pages.addEventListener('change', changed)` |

One difference from native: native treats a negative `numberOfPages` as 0; here it throws `TypeError`.

## See also

- [Building segmented controls and page indicators](../guides/segmented-and-page-controls.md): connecting to paged content, changing colors and images, vertical layout
- [`UIScrollView`](ui-scroll-view.md): horizontally paged content, `isPagingEnabled`, the `scroll` event
- [`UIControl`](ui-control.md): all control events
- [`UIImage`](ui-image.md): getting SF Symbols and your own images
- [Colors](ui-color.md): how to write color strings
