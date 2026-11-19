---
type: reference
native: UISegmentedControl
status: partial
---

# `UISegmentedControl`

**`UISegmentedControl`** represents a segmented control: a horizontal row of segments, each showing a title or an image, with at most one segment selected at a time. Use it to switch between two to five parallel options, such as "Day / Week / Month" or "All / Unread".

Segments are referred to by index, starting at 0. Read and write the selected segment through [`selectedSegmentIndex`](ui-segmented-control/selectedsegmentindex.md). When the user taps a different segment, the control fires a [`change`](ui-control/change-event.md) event. Changing the selected segment from code does not fire `change`.

A newly created control has no selected segment, and `selectedSegmentIndex` is -1. Reading or writing a segment's content with an out-of-range index throws `TypeError`; it is not ignored.

The control's width is computed from its content. You can also give it a larger width with constraints or `frame`, and the segments share it equally. The height is set by the system; measured on iOS 27.2, it is 32 [pt](units.md).

A segmented control is a [control](ui-control.md): enabling, state, and events come from `UIControl`. A control is also a [view](ui-view.md): position, size, and background color come from `UIView`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UISegmentedControl`

For how to build common designs with it, see the guide [Building segmented controls and page indicators](../guides/segmented-and-page-controls.md).

## Constructor

[`UISegmentedControl()`](ui-segmented-control/constructor.md)

Creates a segmented control from an array of titles and images, one segment per item.

## Instance properties

Also inherits properties from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). The inherited properties most often used with a segmented control are `isEnabled` and `translatesAutoresizingMaskIntoConstraints`.

| Property | Description |
| --- | --- |
| [`numberOfSegments`](ui-segmented-control/numberofsegments.md) <small>read-only</small> | The number of segments |
| [`selectedSegmentIndex`](ui-segmented-control/selectedsegmentindex.md) | The index of the selected segment. -1 means none is selected |
| [`isMomentary`](ui-segmented-control/ismomentary.md) | Whether a segment stays selected after a tap; turn this on to use the control as a row of buttons |
| [`apportionsSegmentWidthsByContent`](ui-segmented-control/apportionssegmentwidthsbycontent.md) | Whether segment widths follow their content or are equal |
| [`selectedSegmentTintColor`](ui-segmented-control/selectedsegmenttintcolor.md) | The color of the highlight behind the selected segment |

## Instance methods

Also inherits methods from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md).

Adding and removing segments:

| Method | Description |
| --- | --- |
| [`insertSegmentWithTitle()`](ui-segmented-control/insertsegmentwithtitle.md) | Inserts a title segment |
| [`insertSegmentWithImage()`](ui-segmented-control/insertsegmentwithimage.md) | Inserts an image segment |
| [`removeSegmentAtIndex()`](ui-segmented-control/removesegmentatindex.md) | Removes one segment |
| [`removeAllSegments()`](ui-segmented-control/removeallsegments.md) | Removes all segments |

Setting a segment's content, with the index in `{ forSegmentAtIndex }`:

| Method | Description |
| --- | --- |
| [`setTitle()`](ui-segmented-control/settitle.md) | Sets the segment's title |
| [`setImage()`](ui-segmented-control/setimage.md) | Sets the segment's image |
| [`setWidth()`](ui-segmented-control/setwidth.md) | Sets the segment's width |
| [`setContentOffset()`](ui-segmented-control/setcontentoffset.md) | Nudges the title or image inside the segment |
| [`setEnabled()`](ui-segmented-control/setenabled.md) | Disables or enables just this segment |

Reading a segment's content:

| Method | Description |
| --- | --- |
| [`titleForSegmentAtIndex()`](ui-segmented-control/titleforsegmentatindex.md) | The segment's title |
| [`imageForSegmentAtIndex()`](ui-segmented-control/imageforsegmentatindex.md) | The segment's image |
| [`widthForSegmentAtIndex()`](ui-segmented-control/widthforsegmentatindex.md) | The segment's width |
| [`contentOffsetForSegmentAtIndex()`](ui-segmented-control/contentoffsetforsegmentatindex.md) | The offset of the content inside the segment |
| [`isEnabledForSegmentAtIndex()`](ui-segmented-control/isenabledforsegmentatindex.md) | Whether the segment can be tapped |

## Events

All events are inherited from [`UIControl`](ui-control.md); listen with `addEventListener()`. A segmented control uses:

| Event | When it fires |
| --- | --- |
| [`change`](ui-control/change-event.md) | The user tapped a segment and the selected segment changed. When `isMomentary` is `true`, it fires on every tap |

## Examples

### Day / Week / Month

Starting from a blank app, put a "Day / Week / Month" segmented control on screen, with a label below that shows which segment is selected.

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
  label.text = 'Showing Day view';

  seg.addEventListener('change', () => {
    label.text = 'Showing ' + titles[seg.selectedSegmentIndex] + ' view';
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

- A segmented control spans the top of the screen. The three segments are equal in width, and "Day" looks selected. Below it is "Showing Day view".
- Tap "Week": the selection highlight slides to "Week", and the text changes to "Showing Week view".
- Tap the already selected "Week" again: nothing happens.

`safeAreaLayoutGuide` is the area of the view controller that is not covered by the notch or the rounded corners; see [Auto Layout](auto-layout.md).

For more patterns, see the guide [Building segmented controls and page indicators](../guides/segmented-and-page-controls.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UISegmentedControl alloc] initWithItems:@[@"Day", @"Week"]]` | `new UISegmentedControl(['Day', 'Week'])` |
| `seg.selectedSegmentIndex = UISegmentedControlNoSegment` | `seg.selectedSegmentIndex = -1` |
| `seg.momentary = YES` | `seg.isMomentary = true` |
| `[seg insertSegmentWithTitle:@"Year" atIndex:3 animated:YES]` | `seg.insertSegmentWithTitle('Year', { atIndex: 3, animated: true })` |
| `[seg removeSegmentAtIndex:0 animated:NO]` | `seg.removeSegmentAtIndex(0)` |
| `[seg setTitle:@"This week" forSegmentAtIndex:1]` | `seg.setTitle('This week', { forSegmentAtIndex: 1 })` |
| `[seg titleForSegmentAtIndex:1]` | `seg.titleForSegmentAtIndex(1)` |
| `[seg setEnabled:NO forSegmentAtIndex:2]` | `seg.setEnabled(false, { forSegmentAtIndex: 2 })` |
| `[seg setContentOffset:CGSizeMake(0, 2) forSegmentAtIndex:0]` | `seg.setContentOffset({ width: 0, height: 2 }, { forSegmentAtIndex: 0 })` |
| `[seg addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `seg.addEventListener('change', changed)` |

Two differences from native:

- Natively, some methods throw on an out-of-range index and others silently do nothing; here they all throw `TypeError`.
- Natively, after the selected segment is removed, `selectedSegmentIndex` reads -2; here it is -1.

## See also

- [Building segmented controls and page indicators](../guides/segmented-and-page-controls.md): icon segments, clearing the selection, adding and removing segments, using the control as buttons
- [`UIControl`](ui-control.md): `isEnabled` and all control events
- [`UIImage`](ui-image.md): getting SF Symbols and your own images
- [Colors](ui-color.md): how to write color strings
- [`UITabBarController`](ui-tab-bar-controller.md): to switch between several full screens, use a tab bar instead of a segmented control
