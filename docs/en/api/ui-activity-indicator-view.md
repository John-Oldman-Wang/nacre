---
type: reference
native: UIActivityIndicatorView
status: done
---

# `UIActivityIndicatorView`

**`UIActivityIndicatorView`** represents an activity indicator (a spinner): a ring of short lines that keeps rotating, telling the user that something is in progress and has no result yet. It has only two states, spinning and not spinning, and doesn't show how much is done. When you know how much is done, use [`UIProgressView`](ui-progress-view.md).

The app's code controls the indicator. Call [`startAnimating()`](ui-activity-indicator-view/startanimating.md) to start it and [`stopAnimating()`](ui-activity-indicator-view/stopanimating.md) to stop it. It doesn't know what the app is waiting for, so it never starts or stops on its own. By default it hides itself when not spinning, so a newly created indicator is invisible.

An activity indicator is a [view](ui-view.md): its position, size, hiding, and opacity come from `UIView`. It isn't a control: tapping it does nothing, and it fires no events. While it spins it doesn't block the UI; buttons on the page can still be tapped.

The values and state changes on this page and its member pages (sizes, defaults, when it hides) were measured in the simulator (iPhone Air, iOS 27.2). What it looks like on screen (the shape and color of the indicator, whether it's rotating) is **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIActivityIndicatorView`

For how to show an indicator while waiting, see the guide [Showing loading and progress](../guides/loading-and-progress.md).

## Constructor

[`UIActivityIndicatorView()`](ui-activity-indicator-view/constructor.md)

Creates an activity indicator in the `'medium'` style. It's hidden, not spinning, and its `frame` is 0 × 0.

## Instance properties

Also inherits the properties of [`UIView`](ui-view.md). The inherited properties commonly used with an activity indicator are `isHidden`, `center`, and `translatesAutoresizingMaskIntoConstraints`.

| Property | Description |
| --- | --- |
| [`activityIndicatorViewStyle`](ui-activity-indicator-view/activityindicatorviewstyle.md) | The size of the indicator: `'medium'` or `'large'` |
| [`hidesWhenStopped`](ui-activity-indicator-view/hideswhenstopped.md) | Whether it hides when not spinning |
| [`color`](ui-activity-indicator-view/color.md) | The color of the indicator |
| [`isAnimating`](ui-activity-indicator-view/isanimating.md) <small>read-only</small> | Whether it's spinning |

## Instance methods

Also inherits the methods of [`UIView`](ui-view.md). When positioning with `frame`, the inherited `sizeToFit()` is commonly used.

| Method | Description |
| --- | --- |
| [`startAnimating()`](ui-activity-indicator-view/startanimating.md) | Starts spinning and shows the indicator |
| [`stopAnimating()`](ui-activity-indicator-view/stopanimating.md) | Stops spinning and hides the indicator |

## Events

An activity indicator fires no events. Its state changes only through the app's own code.

## Concepts

### Who controls showing and hiding

The indicator writes its own `isHidden`. Whether it shows is decided by `hidesWhenStopped` and `isAnimating` together:

| `hidesWhenStopped` | `isAnimating` | `isHidden` |
| --- | --- | --- |
| `true` (default) | `false` | `true`, not shown |
| `true` (default) | `true` | `false`, shown and rotating |
| `false` | `false` | `false`, shown but still |
| `false` | `true` | `false`, shown and rotating |

So you don't need to write `isHidden` when using an activity indicator; just call `startAnimating()` and `stopAnimating()`.

`isHidden` is still a writable property. Writing `true` to `isHidden` while it's spinning hides the indicator, and `isAnimating` stays `true`. You usually don't need to do this.

### Size follows the style

The size the indicator wants is determined by its style, and you can read it from the inherited `intrinsicContentSize`:

| Style | `intrinsicContentSize` |
| --- | --- |
| `'medium'` (default) | 20 × 20 pt |
| `'large'` | 37 × 37 pt |

Changing the style changes only this value, not `frame`. [Auto Layout](auto-layout.md) and [`UIStackView`](ui-stack-view.md) size the indicator from this value, so when positioning with constraints you only need to constrain its position. `sizeToFit()` sets `frame` to this value.

All sizes are in [points (pt)](units.md).

## Examples

### Spin in the center of the screen for three seconds

Starting from a blank app, put an activity indicator in the center of the screen and stop it after three seconds.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const spinner = new UIActivityIndicatorView();
  spinner.activityIndicatorViewStyle = 'large';

  spinner.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(spinner);
  NSLayoutConstraint.activateConstraints([
    spinner.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    spinner.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);

  spinner.startAnimating();

  setTimeout(() => {
    spinner.stopAnimating();
    console.log('Stopped, isHidden =', spinner.isHidden);
  }, 3000);
});
```

**Effect**

- A 37 × 37 pt gray activity indicator appears in the center of the screen, rotating continuously.
- After three seconds the indicator disappears, and the console prints `Stopped, isHidden = true`.

This code hasn't been run as a whole in the simulator.

### Spin while waiting for a request

```js
const spinner = new UIActivityIndicatorView();

async function load() {
  spinner.startAnimating();
  try {
    const response = await fetch('https://httpbin.org/delay/2');
    console.log('Status code', response.status);
  } finally {
    spinner.stopAnimating();
  }
}
load();
```

**Effect**: The indicator appears when the request is sent and disappears when the request ends, whether it succeeds or fails. **Not verified in the simulator.**

For more patterns, see the guide [Showing loading and progress](../guides/loading-and-progress.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIActivityIndicatorView alloc] init]` | `new UIActivityIndicatorView()` |
| `[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleLarge]` | `const s = new UIActivityIndicatorView(); s.activityIndicatorViewStyle = 'large'; s.sizeToFit();` |
| `s.activityIndicatorViewStyle = UIActivityIndicatorViewStyleMedium` | `s.activityIndicatorViewStyle = 'medium'` |
| `s.hidesWhenStopped = NO` | `s.hidesWhenStopped = false` |
| `s.color = UIColor.whiteColor` | `s.color = 'white'` |
| `[s startAnimating]` | `s.startAnimating()` |
| `[s stopAnimating]` | `s.stopAnimating()` |
| `s.isAnimating` | `s.isAnimating` |

The three values `UIActivityIndicatorViewStyleWhiteLarge`, `UIActivityIndicatorViewStyleWhite`, and `UIActivityIndicatorViewStyleGray` have been deprecated since iOS 13 and have no equivalent. Use `'large'` or `'medium'` plus `color` instead.

## See also

- [Showing loading and progress](../guides/loading-and-progress.md): waiting for a request, placing the indicator next to text, disabling a button while waiting
- [`UIProgressView`](ui-progress-view.md): use it when you know how much is done
- [`UIView`](ui-view.md): the parent class; position, size, hiding
- [Auto Layout](auto-layout.md): constraining only the position
- [`UIStackView`](ui-stack-view.md): placing the indicator and text in a row
- [Colors](ui-color.md)
- [Units](units.md)
