---
type: reference
native: UINavigationController.hidesBarsOnSwipe
---

# `UINavigationController`: `hidesBarsOnSwipe` property

The **`hidesBarsOnSwipe`** property automatically hides the navigation bar and toolbar when the user swipes up on the content.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Swiping up on the content hides the navigation bar and toolbar; swiping down brings them back. **Not verified in the simulator** |
| `false` | Doesn't hide them automatically |

- Readable and writable.
- The default is `false`.
- Hiding and showing are driven by the gesture [`barHideOnSwipeGestureRecognizer`](barhideonswipegesturerecognizer.md).
- No event fires when the system hides the navigation bar; read [`isNavigationBarHidden`](isnavigationbarhidden.md) to know whether it is hidden right now. This property itself only changes through code.

### Invalid values

Doesn't throw. The written value is converted by JS truthiness: `0`, `''`, `null`, and `undefined` give `false`; everything else gives `true`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsOnSwipe = true;
console.log(nav.hidesBarsOnSwipe);
```

**Effect**: The console prints `true`. After that, swiping up on the content hides the navigation bar. **The hiding effect is not verified in the simulator.**

## Corresponding iOS API

`UINavigationController.hidesBarsOnSwipe`.

## See also

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md), [`hidesBarsOnTap`](hidesbarsontap.md), [`hidesBarsWhenKeyboardAppears`](hidesbarswhenkeyboardappears.md), [`hidesBarsWhenVerticallyCompact`](hidesbarswhenverticallycompact.md): the other ways to hide the navigation bar automatically
- [`isNavigationBarHidden`](isnavigationbarhidden.md): whether the navigation bar is hidden right now
