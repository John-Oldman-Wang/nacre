---
type: reference
native: UINavigationController.viewControllers
---

# `UINavigationController`: `viewControllers` property

The **`viewControllers`** property holds all view controllers in the stack, bottom first and top last.

## Value

An array of `UIViewController`.

- Readable and writable. Assigning replaces the whole stack without animation; for an animation, use [`setViewControllers()`](setviewcontrollers.md).
- The default is an empty array, or just the view controller given to the constructor.
- What you read is a snapshot at that moment. Calling `push` on this array doesn't change the stack; assign a whole array, or use the push and pop methods.
- Each element read is the same object that was put in, so it can be compared with `===`.
- View controllers not in the new array are effectively popped: if no variable holds them, they are collected.
- The notifications that the stack changed are the [`beforeshow`](beforeshow-event.md) and [`show`](show-event.md) events. After the user taps back or swipes back, what you read in the `show` callback is already the stack after going back (measured).

### Invalid values

If the assigned array contains something that isn't a view controller, it throws `TypeError: viewControllers only accepts UIViewController`. The original stack is unchanged.

## Examples

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
nav.pushViewController(new UIViewController(), { animated: false });
console.log(nav.viewControllers.length);

nav.viewControllers = [home];
console.log(nav.viewControllers.length, nav.topViewController === home);
```

**Result**: First prints `2`, then `1 true`. The stack on screen is left with only the home view controller, which is shown immediately.

## Corresponding iOS API

`UINavigationController.viewControllers`.

## See also

- [`setViewControllers()`](setviewcontrollers.md)
- [`topViewController`](topviewcontroller.md)
