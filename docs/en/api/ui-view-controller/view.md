---
type: reference
native: UIViewController.view
---

# `UIViewController`: `view` property

The **`view`** property is the view controller's root view. All the interface content for that screen goes inside it.

## Value

A [`UIView`](../ui-view.md).

- Read-only; assigning to it throws `TypeError`.
- Always has a value.
- **Created the first time it is read.** Right after `new UIViewController()` there is no view yet; the system creates it the first time `page.view` is read. Every later read returns the same object. You can add content to it at any time, including before the view controller is shown.
- **Its size is decided by the system.** When the view controller is a window's root view controller, `view` fills the whole window; on a navigation stack or when presented modally, the navigation controller and the system set it. You do not need to set `frame` yourself. Only for child view controllers you add yourself does the app's code give the position and size of their `view`.
- **It cannot be replaced with another view.** To use a scroll view for a screen's content, add the scroll view as a subview of `page.view` and make it fill it.
- **By default it has no background color and is transparent.** A root view controller with no background color shows a black screen; a modal view controller with no background color shows the content underneath through it. **Neither is verified in the simulator.**
- **Before the view controller is shown, its size and safe area are not final.** Measured: for a view controller not yet in a window, `view.safeAreaInsets` is 0 pt on all four edges. Content positioned with constraints is not affected; it moves into place during layout.

## Examples

```js
const page = new UIViewController();
page.view.backgroundColor = 'systemBackground';

const label = new UILabel();
label.text = 'Hello';
label.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(label);

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  label.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
  label.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
]);
console.log(page.view === page.view);
```

**Effect**

- When the view controller is shown, "Hello" appears in the top-left corner, 16 [pt](../units.md) from the top and left edges of the safe area.
- The background is white in light mode and black in dark mode.
- The console prints `true`.

## Corresponding iOS API

`UIViewController.view`. In ObjC `view` is writable; here it is read-only.

## See also

- [View controllers and views](../ui-view-controller.md#view-controllers-and-views)
- [`UIView`](../ui-view.md)
- [Auto Layout](../auto-layout.md): using `safeAreaLayoutGuide`
