---
type: reference
native: UINavigationController.hidesBarsOnTap
---

# `UINavigationController`: `hidesBarsOnTap` property

The **`hidesBarsOnTap`** property makes a tap on the content toggle the navigation bar and toolbar.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | A tap on the content hides the navigation bar and toolbar; another tap brings them back. **Not verified in the simulator** |
| `false` | Tapping the content doesn't affect the navigation bar |

- Readable and writable.
- The default is `false`.
- The toggling is driven by the gesture [`barHideOnTapGestureRecognizer`](barhideontapgesturerecognizer.md).
- No event fires when the system hides the navigation bar; read [`isNavigationBarHidden`](isnavigationbarhidden.md) to know whether it is hidden right now. This property itself only changes through code.

### Invalid values

Doesn't throw. The written value is converted by JS truthiness: `0`, `''`, `null`, and `undefined` give `false`; everything else gives `true`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsOnTap = true;
console.log(nav.hidesBarsOnTap);
```

**Effect**: The console prints `true`. After that, a tap on the content hides the navigation bar. **The hiding effect is not verified in the simulator.**

## Corresponding iOS API

`UINavigationController.hidesBarsOnTap`.

## See also

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md), [`hidesBarsOnTap`](hidesbarsontap.md), [`hidesBarsWhenKeyboardAppears`](hidesbarswhenkeyboardappears.md), [`hidesBarsWhenVerticallyCompact`](hidesbarswhenverticallycompact.md): the other ways to hide the navigation bar automatically
- [`isNavigationBarHidden`](isnavigationbarhidden.md): whether the navigation bar is hidden right now
