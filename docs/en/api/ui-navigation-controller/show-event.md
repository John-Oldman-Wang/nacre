---
type: reference
native: "-[UINavigationControllerDelegate navigationController:didShowViewController:animated:]"
---

# `UINavigationController`: `show` event

The **`show`** event fires when the navigation controller has shown a view controller and the transition animation has finished.

## Syntax

```
nav.addEventListener('show', (event) => { })
```

## Event object

[`UINavigationControllerEvent`](../ui-navigation-controller-event.md), with one extra read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`viewController`](../ui-navigation-controller-event/viewcontroller.md) | `UIViewController` | The view controller that has been shown |

Not cancelable.

## When it fires

- Fires when code pushes a view controller; also fires when the user taps the back button or swipes back, and both cases receive the same event (measured). When you need to tell push from pop, compare `nav.viewControllers.length` before and after the transition.
- When it fires, `nav.viewControllers` is already the stack after the transition (measured). So any "current path" or "current level" your code keeps separately should be realigned here with `nav.viewControllers`.
- Whether it fires when code calls the `popViewController()` family of methods is **not verified in the simulator**.
- Whether it fires when the bottom view controller is first shown after the app launches is **not verified in the simulator**.
- The callback doesn't run synchronously at the moment of the transition; it runs a little later. See [How the runtime works](../how-it-works.md).

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.addEventListener('show', (event) => {
  console.log(event.type, event.target === nav, event.viewController === nav.topViewController);
});
```

**Effect**: Each time a transition finishes, it prints `show true true`.

## Corresponding iOS API

`navigationController:didShowViewController:animated:` on `UINavigationControllerDelegate`.

## See also

- [`beforeshow`](beforeshow-event.md)
- [The user can go back on their own](../ui-navigation-controller.md#the-user-can-go-back-on-their-own)
