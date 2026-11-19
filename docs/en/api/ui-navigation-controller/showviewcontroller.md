---
type: reference
native: "-[UINavigationController showViewController:sender:]"
---

# `UINavigationController`: `showViewController()` method

The **`showViewController()`** method shows a view controller. On a navigation controller it is the same as an animated [`pushViewController()`](pushviewcontroller.md): it pushes the view controller onto the top of the stack.

## Syntax

```
showViewController(viewController)
showViewController(viewController, { sender })
```

### Parameters

**`viewController`**

The [`UIViewController`](../ui-view-controller.md) to show.

**`options.sender`**

Optional. The object that initiated the showing, such as the button that was tapped; it is passed to the system as is. It can be any native object, or `null`, or omitted.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `viewController` isn't a view controller: `showViewController: expects a UIViewController`.
- The view controller already has a place elsewhere (for example, it is currently a window's root view controller), and the system refuses to put it in the stack: the error starts with `showViewController: `, followed by the reason given by the system.

When it throws, the stack is unchanged.

## Description

Unlike `pushViewController()`, it doesn't take `{ animated }`; the system always pushes with an animation. To control the animation, use `pushViewController()`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
const detail = new UIViewController();
nav.showViewController(detail);
console.log(nav.viewControllers.length, nav.topViewController === detail);
```

**Result**: Prints `2 true`. The screen switches to `detail` with an animation; **the animation is not verified in the simulator.**

## Corresponding iOS API

`-[UINavigationController showViewController:sender:]`. The header states that on a navigation controller it is treated as `pushViewController:animated:`.

## See also

- [`pushViewController()`](pushviewcontroller.md)
