---
type: reference
native: UIProgressView
status: partial
---

# `UIProgressView`

**`UIProgressView`** represents a progress bar: a horizontal line with a filled portion starting from the left, whose length shows how much of a task is complete. The fraction complete is given by the [`progress`](ui-progress-view/progress.md) property: 0 means not started, 1 means fully complete.

A progress bar doesn't advance on its own. It shows the value the app writes to `progress`; each time the app learns that the task has moved forward, it writes a new value. So it suits tasks whose steps can be counted: 10 images in total, the 3rd one uploaded, progress is 0.3. When you don't know how much is done and only know it's still going, use [`UIActivityIndicatorView`](ui-activity-indicator-view.md).

A progress bar is a [view](ui-view.md): position, width, hiding, and opacity come from `UIView`. It isn't a control: the user can't drag it, and it fires no events.

The values and state changes on this page and its member pages (height, defaults, value ranges) were measured in the simulator (iPhone Air, iOS 27.2). How it looks on screen (colors, animation, how images are laid out) is **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIProgressView`

For how to show a task's progress, see the guide [Showing loading and progress](../guides/loading-and-progress.md).

## Constructor

[`UIProgressView()`](ui-progress-view/constructor.md)

Creates a progress bar with the `'default'` style. `progress` is 0, and `frame` is 0 wide and 4 pt tall.

## Instance properties

Also inherits properties from [`UIView`](ui-view.md). Inherited properties commonly used with progress bars are `isHidden`, `frame`, and `translatesAutoresizingMaskIntoConstraints`.

| Property | Description |
| --- | --- |
| [`progress`](ui-progress-view/progress.md) | The fraction complete, 0 to 1 |
| [`progressViewStyle`](ui-progress-view/progressviewstyle.md) | The style, which determines the height |
| [`progressTintColor`](ui-progress-view/progresstintcolor.md) | The color of the filled portion |
| [`trackTintColor`](ui-progress-view/tracktintcolor.md) | The color of the unfilled portion |
| [`progressImage`](ui-progress-view/progressimage.md) | The image used for the filled portion |
| [`trackImage`](ui-progress-view/trackimage.md) | The image used for the unfilled portion |

## Instance methods

Also inherits methods from [`UIView`](ui-view.md).

| Method | Description |
| --- | --- |
| [`setProgress()`](ui-progress-view/setprogress.md) | Changes the progress, optionally animated |

## Events

A progress bar fires no events. Its values are changed only by the app's own code.

## Concepts

### The height is determined by the style

| Style | Height |
| --- | --- |
| `'default'` (default) | 4 pt |
| `'bar'` | Less than 4 pt. 2.67 pt on a 3x screen |

Every time a progress bar's `frame` or `bounds` is set, it resets the height to the value determined by its style: the height in a `frame` write doesn't take effect (write 30 and it still reads back 4); only the position and width are applied. Height constraints aren't subject to this; for a thicker progress bar, add a height constraint.

The inherited `intrinsicContentSize` reads a width of -1, meaning the progress bar has no width requirement; the width comes from `frame` or constraints.

All sizes are in [points (pt)](units.md).

### Color or image, not both

Each of the two portions has a color property and an image property:

| | Color | Image |
| --- | --- | --- |
| Filled portion | `progressTintColor` | `progressImage` |
| Unfilled portion | `trackTintColor` | `trackImage` |

Only one of a portion's color and image is in effect; the one written last wins:

- Writing an image sets the same portion's color to `null`.
- Writing a color sets the same portion's image to `null`.
- Writing `null` to the color doesn't affect the image.

The two portions don't affect each other.

### `progress` is a 32-bit float

`progress` is stored as a 32-bit float. Write `0.3`, and it reads back `0.30000001192092896`. Values that a 32-bit float represents exactly, such as 0.5 and 0.25, read back unchanged. So don't test with `bar.progress === 0.3`: to compare, compare with `Math.fround(0.3)`; to display a percentage, use `Math.round(bar.progress * 100)`.

## Examples

### Advancing one step every half second

Starting from a blank app, place a progress bar on the page that advances one step every half second and stops when full.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const bar = new UIProgressView();

  const safe = page.view.safeAreaLayoutGuide;
  bar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(bar);
  NSLayoutConstraint.activateConstraints([
    bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
    bar.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 40 }),
  ]);

  const total = 10;
  let done = 0;
  const timer = setInterval(() => {
    done += 1;
    bar.setProgress(done / total, { animated: true });
    console.log('Done', done, '/', total);
    if (done === total) clearInterval(timer);
  }, 500);
});
```

**Effect**

- A light horizontal line 4 pt tall appears near the top of the page, with 24 pt of margin on each side.
- Every half second, the blue portion on the left grows by one step, and the console prints `Done 1 / 10`, `Done 2 / 10`, …
- After five seconds the whole line is blue, and it stops.

The safe area is the region of the screen not covered by the notch, the rounded corners, or the home indicator at the bottom; see [`UIView`'s safe area](ui-view.md#safe-area).

This code has not been run as a whole in the simulator.

For more patterns, see the guide [Showing loading and progress](../guides/loading-and-progress.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIProgressView alloc] init]` | `new UIProgressView()` |
| `[[UIProgressView alloc] initWithProgressViewStyle:UIProgressViewStyleBar]` | `const bar = new UIProgressView(); bar.progressViewStyle = 'bar';` |
| `bar.progress = 0.5f` | `bar.progress = 0.5` |
| `[bar setProgress:0.8f animated:YES]` | `bar.setProgress(0.8, { animated: true })` |
| `bar.progressViewStyle = UIProgressViewStyleBar` | `bar.progressViewStyle = 'bar'` |
| `bar.progressTintColor = UIColor.systemGreenColor` | `bar.progressTintColor = 'systemGreen'` |
| `bar.trackTintColor = nil` | `bar.trackTintColor = null` |
| `bar.progressImage = image` | `bar.progressImage = image` |
| `bar.trackImage = image` | `bar.trackImage = image` |

A progress bar created with `initWithProgressViewStyle:` has a `frame` 160 pt wide; one created with `new UIProgressView()` is 0 wide. Once a width is given, the two are the same.

## See also

- [Showing loading and progress](../guides/loading-and-progress.md): converting to progress, showing a percentage, changing the thickness, hiding when done
- [`UIActivityIndicatorView`](ui-activity-indicator-view.md): for when you don't know how much is done
- [`UIView`](ui-view.md): the parent class; position, width, hiding
- [Auto Layout](auto-layout.md): how to constrain the left and right edges and the height
- [Colors](ui-color.md)
- [`UIImage`](ui-image.md): the type of `progressImage` and `trackImage`
- [Units](units.md)
