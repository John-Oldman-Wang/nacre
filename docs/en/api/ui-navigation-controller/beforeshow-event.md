---
type: reference
native: "-[UINavigationControllerDelegate navigationController:willShowViewController:animated:]"
---

# `UINavigationController`: `beforeshow` event

The **`beforeshow`** event fires when the navigation controller is about to show a view controller, as the transition begins.

## Syntax

```
nav.addEventListener('beforeshow', (event) => { })
```

## Event object

[`UINavigationControllerEvent`](../ui-navigation-controller-event.md), with one extra read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`viewController`](../ui-navigation-controller-event/viewcontroller.md) | `UIViewController` | The view controller about to be shown |

Not cancelable, and it can't be used to stop the user from going back.

## When it fires

- Fires when code pushes a view controller; also fires when the user taps the back button or swipes back, and both cases receive the same event (measured). The event object has no field telling "code or user" or "push or pop" apart; when you need to tell, compare `nav.viewControllers.length` before and after the transition.
- Whether it fires when code calls the `popViewController()` family of methods is **not verified in the simulator**.
- The callback doesn't run synchronously at the moment of the transition; it runs a little later. See [How the runtime works](../how-it-works.md).

To tell which view controller is about to be shown, use `event.viewController`, not `nav.topViewController`.

## Examples

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
nav.addEventListener('beforeshow', (event) => {
  nav.setNavigationBarHidden(event.viewController === home, { animated: true });
});
```

**Effect**: The home view controller has no navigation bar; the navigation bar appears when you go to another view controller and disappears again when you return home. The acceptance tests' interface does exactly this.

## Corresponding iOS API

`navigationController:willShowViewController:animated:` on `UINavigationControllerDelegate`. `nav.delegate` isn't exposed.

## See also

- [`show`](show-event.md)
