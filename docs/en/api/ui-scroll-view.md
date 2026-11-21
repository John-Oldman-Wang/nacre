---
type: reference
native: UIScrollView
status: partial
---

# `UIScrollView`

**`UIScrollView`** represents a view that can scroll, called a scroll view. When the content inside it is larger than the view itself, the user drags with a finger to see the rest. Dragging, the momentum scrolling after release, bouncing back after reaching an end, and the scroll indicators are all handled by the system with no code needed.

A scroll view does not measure the subviews inside it. The app must tell it how large the content is: align the four edges of the content with [`contentLayoutGuide`](ui-scroll-view/contentlayoutguide.md) using constraints, or write [`contentSize`](ui-scroll-view/contentsize.md) directly. Read the scroll position from [`contentOffset`](ui-scroll-view/contentoffset.md); the [`scroll`](ui-scroll-view/scroll-event.md) event fires when it changes.

[`UITextView`](ui-text-view.md) and [`UICollectionView`](ui-collection-view.md) are both scroll views and have all the members on this page.

All lengths and positions are in [pt](units.md).

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIScrollView`

For how to build a scrolling view controller, what to check when it will not scroll, and how to make carousels and "load more at the bottom", see the guide [Building a scrolling view](../guides/scrolling.md).

## Constructor

[`UIScrollView()`](ui-scroll-view/constructor.md)

Creates a scroll view. Its size is 0, and so is its content area.

## Instance properties

Also inherits the properties of [`UIView`](ui-view.md). Inherited properties commonly used with scroll views are `bounds`, `backgroundColor`, and `keyboardLayoutGuide`.

Position and content size:

| Property | Description |
| --- | --- |
| [`contentOffset`](ui-scroll-view/contentoffset.md) | The current scroll position |
| [`contentSize`](ui-scroll-view/contentsize.md) | The size of the content area |
| [`contentInset`](ui-scroll-view/contentinset.md) | Extra space around the content |
| [`adjustedContentInset`](ui-scroll-view/adjustedcontentinset.md) <small>read-only</small> | The space actually in effect, including what the system adds for the safe area |
| [`contentInsetAdjustmentBehavior`](ui-scroll-view/contentinsetadjustmentbehavior.md) | Whether the system automatically adds space for the safe area |
| [`contentLayoutGuide`](ui-scroll-view/contentlayoutguide.md) <small>read-only</small> | A reference for constraints, representing the content area |
| [`frameLayoutGuide`](ui-scroll-view/framelayoutguide.md) <small>read-only</small> | A reference for constraints, representing the visible area |
| [`contentAlignmentPoint`](ui-scroll-view/contentalignmentpoint.md) | How content smaller than the visible area is placed |

Behavior switches:

| Property | Description |
| --- | --- |
| [`isScrollEnabled`](ui-scroll-view/isscrollenabled.md) | Whether the user can drag |
| [`bounces`](ui-scroll-view/bounces.md) | Whether it can be pulled further after reaching an end |
| [`bouncesHorizontally`](ui-scroll-view/bounceshorizontally.md) | Whether it bounces horizontally |
| [`bouncesVertically`](ui-scroll-view/bouncesvertically.md) | Whether it bounces vertically |
| [`alwaysBounceVertical`](ui-scroll-view/alwaysbouncevertical.md) | Can be pulled vertically even when the content is less than a screen |
| [`alwaysBounceHorizontal`](ui-scroll-view/alwaysbouncehorizontal.md) | Can be pulled horizontally even when the content is less than a screen |
| [`isPagingEnabled`](ui-scroll-view/ispagingenabled.md) | Page by page |
| [`isDirectionalLockEnabled`](ui-scroll-view/isdirectionallockenabled.md) | One direction per drag |
| [`scrollsToTop`](ui-scroll-view/scrollstotop.md) | Scrolls back to the top when the status bar is tapped |
| [`delaysContentTouches`](ui-scroll-view/delayscontenttouches.md) | Determines whether a touch is a scroll before handing it to buttons inside |
| [`canCancelContentTouches`](ui-scroll-view/cancancelcontenttouches.md) | Whether pressing on a button and then moving can turn into a scroll |
| [`transfersHorizontalScrollingToParent`](ui-scroll-view/transfershorizontalscrollingtoparent.md) | Hands horizontal scrolling to the outer scroll view at the end |
| [`transfersVerticalScrollingToParent`](ui-scroll-view/transfersverticalscrollingtoparent.md) | Hands vertical scrolling to the outer scroll view at the end |
| [`allowsKeyboardScrolling`](ui-scroll-view/allowskeyboardscrolling.md) | Whether a hardware keyboard can scroll it |
| [`decelerationRate`](ui-scroll-view/decelerationrate.md) | How far it slides after release before stopping |
| [`keyboardDismissMode`](ui-scroll-view/keyboarddismissmode.md) | Whether to dismiss the keyboard when the user drags |

Scroll indicators:

| Property | Description |
| --- | --- |
| [`showsVerticalScrollIndicator`](ui-scroll-view/showsverticalscrollindicator.md) | Whether to show the indicator when scrolling vertically |
| [`showsHorizontalScrollIndicator`](ui-scroll-view/showshorizontalscrollindicator.md) | Whether to show the indicator when scrolling horizontally |
| [`indicatorStyle`](ui-scroll-view/indicatorstyle.md) | The indicators' color |
| [`verticalScrollIndicatorInsets`](ui-scroll-view/verticalscrollindicatorinsets.md) | The vertical indicator's distance from the edges |
| [`horizontalScrollIndicatorInsets`](ui-scroll-view/horizontalscrollindicatorinsets.md) | The horizontal indicator's distance from the edges |
| [`scrollIndicatorInsets`](ui-scroll-view/scrollindicatorinsets.md) | Both indicators' distance from the edges (deprecated since iOS 13) |
| [`automaticallyAdjustsScrollIndicatorInsets`](ui-scroll-view/automaticallyadjustsscrollindicatorinsets.md) | Whether the system adjusts the indicators' distance for the safe area |
| [`indexDisplayMode`](ui-scroll-view/indexdisplaymode.md) | When the index bar is shown |

Zooming:

| Property | Description |
| --- | --- |
| [`zoomScale`](ui-scroll-view/zoomscale.md) | The current zoom scale |
| [`minimumZoomScale`](ui-scroll-view/minimumzoomscale.md) | The minimum zoom scale |
| [`maximumZoomScale`](ui-scroll-view/maximumzoomscale.md) | The maximum zoom scale |
| [`bouncesZoom`](ui-scroll-view/bounceszoom.md) | Whether zooming beyond the range springs back |
| [`isZooming`](ui-scroll-view/iszooming.md) <small>read-only</small> | Whether it is zooming |
| [`isZoomBouncing`](ui-scroll-view/iszoombouncing.md) <small>read-only</small> | Whether it is springing back into the zoom range |
| [`isZoomAnimating`](ui-scroll-view/iszoomanimating.md) <small>read-only</small> | Whether a zoom animation is running |

Current state and gestures:

| Property | Description |
| --- | --- |
| [`isTracking`](ui-scroll-view/istracking.md) <small>read-only</small> | Whether a finger is pressed on it |
| [`isDragging`](ui-scroll-view/isdragging.md) <small>read-only</small> | Whether the user is dragging |
| [`isDecelerating`](ui-scroll-view/isdecelerating.md) <small>read-only</small> | Whether the content is still sliding after release |
| [`isScrollAnimating`](ui-scroll-view/isscrollanimating.md) <small>read-only</small> | Whether a `setContentOffset()` animation is running |
| [`panGestureRecognizer`](ui-scroll-view/pangesturerecognizer.md) <small>read-only</small> | The gesture recognizer for dragging |
| [`pinchGestureRecognizer`](ui-scroll-view/pinchgesturerecognizer.md) <small>read-only</small> | The gesture recognizer for two-finger pinching |
| [`directionalPressGestureRecognizer`](ui-scroll-view/directionalpressgesturerecognizer.md) <small>read-only</small> | The gesture recognizer for arrow keys |

## Instance methods

Also inherits the methods of [`UIView`](ui-view.md), such as `addSubview()` and `convertRect()`.

| Method | Description |
| --- | --- |
| [`setContentOffset()`](ui-scroll-view/setcontentoffset.md) | Scrolls to a given position, optionally animated |
| [`scrollRectToVisible()`](ui-scroll-view/scrollrecttovisible.md) | Scrolls the shortest distance to make a rectangle fully visible |
| [`flashScrollIndicators()`](ui-scroll-view/flashscrollindicators.md) | Flashes the indicators briefly |
| [`setZoomScale()`](ui-scroll-view/setzoomscale.md) | Changes the zoom scale, optionally animated |
| [`zoomToRect()`](ui-scroll-view/zoomtorect.md) | Zooms so a rectangle fills the visible area |
| [`stopScrollingAndZooming()`](ui-scroll-view/stopscrollingandzooming.md) | Immediately stops any scrolling and zooming in progress |

## Events

Listen with `addEventListener()`.

| Event | When it fires |
| --- | --- |
| [`scroll`](ui-scroll-view/scroll-event.md) | The position changed. Fires for user scrolling, momentum scrolling, and writes from code |
| [`dragbegin`](ui-scroll-view/dragbegin-event.md) | The user started dragging |
| [`beforedragend`](ui-scroll-view/beforedragend-event.md) | The moment the user lifts their finger after dragging. A listener can change where the content stops |
| [`dragend`](ui-scroll-view/dragend-event.md) | The user lifted their finger |
| [`deceleratebegin`](ui-scroll-view/deceleratebegin-event.md) | The content kept sliding after release |
| [`decelerateend`](ui-scroll-view/decelerateend-event.md) | The content came to a complete stop |
| [`scrollanimationend`](ui-scroll-view/scrollanimationend-event.md) | The `setContentOffset()` animation ended |
| [`scrolltotop`](ui-scroll-view/scrolltotop-event.md) | After the user tapped the status bar and it scrolled back to the top |
| [`adjustedcontentinsetchange`](ui-scroll-view/adjustedcontentinsetchange-event.md) | `adjustedContentInset` changed |
| `traitchange` | The [traits](ui-trait-collection.md) changed; inherited from `UIView` |

Rules shared by the eight scroll events other than `beforedragend`:

- **Events carry no data.** The event object has only `type` and `target`. Read the position from `contentOffset` and the state from `isDragging` and `isDecelerating`. When the callback runs, these read the latest values at that moment.
- **None can be canceled.** Scrolling is driven by the system, which does not wait for an answer from JS: while a finger drags, the content moves first, and only afterward does the system notify JS. JS cannot stop or cancel a scroll.
- **They fire after the fact.** When the callback runs, the scroll view's state is already the new one. For example, reading `isDecelerating` in a `dragend` callback gives the actual result of "whether it is still sliding after release".
- **They fire after the current JS finishes running.** A callback is never called in the middle of an assignment.
- **No overhead without listeners.** A scroll view with no listeners for any scroll event does not call into JS when it scrolls.
- **Unrecognized event names do not throw.** They are treated as custom events and fire only when you dispatch them yourself with `dispatchEvent()`. So a misspelled event name (such as `scrol`) gives no warning; the listener is simply never called.

When the user drags and releases, the order is `dragbegin` → `dragend` → `deceleratebegin` → `decelerateend`, with `scroll` firing repeatedly throughout (verified by testing). If the content has already stopped when the finger lifts, the last two events do not fire (**not verified in the simulator**).

[`beforedragend`](ui-scroll-view/beforedragend-event.md) is different: it fires on the spot the moment the finger lifts, before `dragend`, carrying the velocity at release and the stopping position the system computed, and the position a listener writes is where the content stops. It cannot be canceled.

## Three basic concepts

A scroll view's properties revolve around three quantities.

```
        Content area (contentSize)
      ┌───────────────────┐  ─┐
      │                   │   │ contentOffset.y
      │                   │   │ (distance already scrolled)
      │┌─────────────────┐│  ─┘
      ││                 ││
      ││  Visible area   ││   the part actually seen on screen
      ││ (size of bounds)││
      │└─────────────────┘│
      │                   │
      │                   │
      └───────────────────┘
```

| Concept | What it is | Corresponding property |
| --- | --- | --- |
| Visible area | The rectangle the scroll view itself occupies on screen | Width and height of `bounds` |
| Content area | The rectangle all the content occupies, usually larger than the visible area | `contentSize` |
| Offset | How far the top-left corner of the content area has moved out relative to the top-left corner of the visible area | `contentOffset` |

The maximum scroll distance in a direction equals the content area's size minus the visible area's size (plus any space the system adds; see [Safe area](#safe-area)). If the content area is not larger than the visible area, that direction cannot scroll.

## Content area size

There are two ways to state the content area's size:

| Approach | How | When to use |
| --- | --- | --- |
| Constraints | Align the four edges of the container holding the content with [`contentLayoutGuide`](ui-scroll-view/contentlayoutguide.md). The content area is as large as the container | Recommended. The content area follows automatically as content is added or removed |
| Write it directly | `scroller.contentSize = new CGSize(width, height)` | When subviews are positioned with `frame`. You must write it again when the content changes |

Do not use both at once. With constraints, the content area's size is computed only after the system completes layout: reading `contentSize` right after activating the constraints gives the old value; call `layoutIfNeeded()` on the view controller's root view first, then read it.

The other reference, [`frameLayoutGuide`](ui-scroll-view/framelayoutguide.md), represents the visible area. In whichever direction the size equals it, that direction cannot scroll.

## Safe area

The safe area is the region of the screen not obscured by the notch, rounded corners, or the home indicator at the bottom.

When a scroll view fills the screen, the system by default adds space above and below the content automatically, so the first and last lines rest within the safe area. While scrolling, content still passes under the notch and the home indicator. This has two consequences:

- With the content at the very top, `contentOffset.y` is not `0` but a negative number equal to the height of the top space.
- To get the actual space, read [`adjustedContentInset`](ui-scroll-view/adjustedcontentinset.md), which equals the app's `contentInset` plus what the system adds automatically. `adjustedcontentinsetchange` fires when the space changes.

The space and negative offset when filling the screen are as iOS defines them and are **not verified in the simulator**. The acceptance tests assert the opposite case: when the scroll view is entirely within the safe area, the system adds no space, and `adjustedContentInset.top` equals `contentInset.top`.

Whether the system adds space is determined by [`contentInsetAdjustmentBehavior`](ui-scroll-view/contentinsetadjustmentbehavior.md).

## Scrolling and JS

**Reading the position and changing views in a `scroll` callback is normal usage**, for example changing the title bar's opacity by scroll distance, or loading the next page when reaching the bottom. This rests on three measured facts:

- `scroll` events do not pile up. Scrolling that happens while a previous `scroll` has not yet fired does not queue another event; when the callback runs, it reads the latest position.
- One property read or one property write takes a few microseconds each (measured: 1.3–7 µs per read or write).
- One real swipe lasting 1819 ms fired `scroll` 100 times (simulator, Debug build).

`scroll` callbacks and UI updates run one after another on the same thread; for background, see [How the runtime works](how-it-works.md).

However many views you put in a scroll view, that many views are created; it does not create only the ones visible on screen. Measured: creating a view takes about 4 µs, writing a property 2–7 µs, creating a constraint about 10 µs, and one `addSubview()` about 12 µs. For very many rows (hundreds or more), the total time and memory to create all rows at once has **no measurement data**. To create only the visible rows, use [`UICollectionView`](ui-collection-view.md).

## Examples

### A scrolling page with 40 lines of text

Starting from a blank app, make a page that scrolls up and down, containing 40 lines of text.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const scroller = new UIScrollView();
  scroller.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(scroller);

  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;
  scroller.addSubview(column);

  for (let i = 1; i <= 40; i++) {
    const label = new UILabel();
    label.text = `Line ${i}`;
    column.addArrangedSubview(label);
  }

  const content = scroller.contentLayoutGuide;
  const frame = scroller.frameLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    scroller.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
    scroller.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
    scroller.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
    scroller.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
    column.topAnchor.constraintEqualToAnchor(content.topAnchor),
    column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
    column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
    column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
    column.widthAnchor.constraintEqualToAnchor(frame.widthAnchor),
  ]);
});
```

**Effect**

- "Line 1", "Line 2", … are arranged from top to bottom; 40 lines do not fit on one screen.
- Dragging up and down moves the content with the finger. After release, the content slides a little further before stopping.
- After reaching the very top or bottom, it can be pulled a little further, and springs back on release.
- A thin indicator appears on the right while scrolling and disappears after stopping.
- It cannot be dragged left or right.

This code has not been run as a whole in the simulator. The same structure has been run in the acceptance tests, which assert that the content area's height equals the sum of the row heights plus spacing and that the content area's width equals the visible area's width. Dragging, momentum, bouncing, and the indicator are default system behavior, swiped through by hand during acceptance.

> **Note:** The line `column.translatesAutoresizingMaskIntoConstraints = false` must not be omitted. Without it, the content area is 0, nothing is shown, and the console shows no error; see [Content not showing](../guides/scrolling.md#content-doesnt-show).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIScrollView alloc] init]` | `new UIScrollView()` |
| `sv.contentOffset = CGPointMake(0, 30)` | `sv.contentOffset = new CGPoint(0, 30)` |
| `[sv setContentOffset:p animated:YES]` | `sv.setContentOffset(p, { animated: true })` |
| `[sv scrollRectToVisible:r animated:YES]` | `sv.scrollRectToVisible(r, { animated: true })` |
| `[sv flashScrollIndicators]` | `sv.flashScrollIndicators()` |
| `sv.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever` | `sv.contentInsetAdjustmentBehavior = 'never'` |
| `sv.indicatorStyle = UIScrollViewIndicatorStyleBlack` | `sv.indicatorStyle = 'black'` |
| `sv.decelerationRate = UIScrollViewDecelerationRateFast` | `sv.decelerationRate = 'fast'` |
| `sv.keyboardDismissMode = UIScrollViewKeyboardDismissModeOnDrag` | `sv.keyboardDismissMode = 'onDrag'` |
| `sv.pagingEnabled = YES` | `sv.isPagingEnabled = true` |
| `sv.contentLayoutGuide` | `sv.contentLayoutGuide` |
| `[sv setZoomScale:2 animated:YES]` | `sv.setZoomScale(2, { animated: true })` |
| `- scrollViewDidScroll:` | The `scroll` event |
| `- scrollViewWillBeginDragging:` | The `dragbegin` event |
| `- scrollViewWillEndDragging:withVelocity:targetContentOffset:` | The `beforedragend` event. Write the stopping position to the event object's `targetContentOffset` |
| `- scrollViewDidEndDragging:willDecelerate:` | The `dragend` event. Read `isDecelerating` instead of `willDecelerate` |
| `- scrollViewWillBeginDecelerating:` | The `deceleratebegin` event |
| `- scrollViewDidEndDecelerating:` | The `decelerateend` event |
| `- scrollViewDidEndScrollingAnimation:` | The `scrollanimationend` event |
| `- scrollViewDidScrollToTop:` | The `scrolltotop` event |
| `- scrollViewDidChangeAdjustedContentInset:` | The `adjustedcontentinsetchange` event |
| `sv.delegate` | Not needed; listen for the events above |

### Comparison with the browser

This table is only for people familiar with the web to look up correspondences; the rest of the page does not depend on it.

| Web | `UIScrollView` | Difference |
| --- | --- | --- |
| An element with `overflow: scroll` | `new UIScrollView()` | The content area's size must be stated with constraints or `contentSize`; subviews are not measured automatically |
| `clientWidth` / `clientHeight` | `bounds.width` / `bounds.height` | |
| `scrollWidth` / `scrollHeight` | `contentSize.width` / `contentSize.height` | |
| `scrollLeft` / `scrollTop` | `contentOffset.x` / `contentOffset.y` | With safe area space, the very top is negative |
| `scrollTo({ top, behavior: 'smooth' })` | `setContentOffset(point, { animated: true })` | |
| `scrollIntoView()` | `scrollRectToVisible(rect)` | Takes a rectangle, not an element |
| The `scroll` event | The `scroll` event | Neither carries the position; neither can be canceled |
| The `scrollend` event | `decelerateend`, `scrollanimationend`, and `dragend` with `isDecelerating` `false` | There is no single unified event |
| `scroll-snap-type` | `isPagingEnabled`, or changing the stopping position in `beforedragend` | `isPagingEnabled` can stop only at whole multiples of the visible area |
| `overscroll-behavior: none` | `bounces = false` | |

## See also

- [Building a scrolling view](../guides/scrolling.md): page skeleton, what to check when it will not scroll, horizontal scrolling, carousels, stopping on whole rows, loading more, the keyboard
- [`UIStackView`](ui-stack-view.md): the container holding the content in the example
- [`UIView`](ui-view.md): inherited members; `bounds`, `convertRect()`, background color, and rounded corners are there
- [`UICollectionView`](ui-collection-view.md): lists with large amounts of data, creating only the rows visible on screen
- [`UITextView`](ui-text-view.md): multiline input, also a scroll view
- [Structs](structs.md): `CGPoint`, `CGSize`, `CGRect`, `UIEdgeInsets`
