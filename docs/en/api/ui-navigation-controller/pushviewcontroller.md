---
type: reference
native: "-[UINavigationController pushViewController:animated:]"
---

# `UINavigationController`: `pushViewController()` method

The **`pushViewController()`** method pushes a view controller onto the top of the stack, and the screen switches to it.

## Syntax

```
pushViewController(viewController)
pushViewController(viewController, { animated })
```

### Parameters

**`viewController`**

The view controller to push, a `UIViewController`.

**`options.animated`**

A boolean, optional. `true`: slides in from the right. `false` or omitted: switches directly, without animation.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The argument isn't a view controller: `pushViewController: expects a UIViewController`.
- The pushed view controller is currently a window's root view controller: the message starts with `pushViewController: `, followed by the reason given by the system. The window and the stack stay as they are.

## Description

- After a push you don't need to keep the view controller: the navigation controller keeps it; see [Who keeps the view controllers in the stack alive](../ui-navigation-controller.md#who-keeps-the-view-controllers-in-the-stack-alive).
- The same view controller object can't appear in the stack twice. The result of pushing a view controller that is already in the stack is **not verified in the simulator**. To show two view controllers with the same content, create two view controller objects.
- Pushing fires [`beforeshow`](beforeshow-event.md) and [`show`](show-event.md) (measured).

## Examples

```js
const nav = new UINavigationController(new UIViewController());
const detail = new UIViewController();
detail.title = 'Details';
nav.pushViewController(detail, { animated: true });

console.log(nav.topViewController === detail);
console.log(detail.navigationController === nav);
```

**Effect**: While `nav` is on screen, the screen switches to `detail` with an animation. The console prints `true` and `true`.

## Corresponding iOS API

`-[UINavigationController pushViewController:animated:]`.

## See also

- [`popViewController()`](popviewcontroller.md)
- [Navigating between view controllers](../../guides/navigation.md)
