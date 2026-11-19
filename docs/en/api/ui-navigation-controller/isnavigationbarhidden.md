---
type: reference
native: UINavigationController.navigationBarHidden
---

# `UINavigationController`: `isNavigationBarHidden` property

The **`isNavigationBarHidden`** property determines whether the navigation bar is hidden.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The navigation bar is hidden, and the view controller's content fills the space where the navigation bar was. There is no back button |
| `false` | Shows the navigation bar |

- Readable and writable.
- The default is `false`.
- Writing it isn't animated; the navigation bar disappears or appears immediately. For an animation, use [`setNavigationBarHidden()`](setnavigationbarhidden.md).
- Whether swipe back still works after the navigation bar is hidden is **not verified in the simulator**.
- No event fires when it changes: it only changes through code.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.isNavigationBarHidden = true;
console.log(nav.isNavigationBarHidden);
```

**Result**: The navigation bar disappears immediately. The console prints `true`.

## Corresponding iOS API

`UINavigationController.navigationBarHidden`. In JS it is called `isNavigationBarHidden`.

## See also

- [`setNavigationBarHidden()`](setnavigationbarhidden.md)
