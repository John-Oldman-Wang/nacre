---
type: reference
native: UINavigationController.hidesBarsWhenKeyboardAppears
---

# `UINavigationController`: `hidesBarsWhenKeyboardAppears` property

The **`hidesBarsWhenKeyboardAppears`** property automatically hides the navigation bar and toolbar when the keyboard appears.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | When a text field in the view controller brings up the keyboard, the navigation bar and toolbar hide. **Not verified in the simulator** |
| `false` | The keyboard appearing doesn't affect the navigation bar |

- Readable and writable.
- The default is `false`.
- No event fires when the system hides the navigation bar; read [`isNavigationBarHidden`](isnavigationbarhidden.md) to know whether it is hidden right now. This property itself only changes through code.

### Invalid values

Doesn't throw. The written value is converted by JS truthiness: `0`, `''`, `null`, and `undefined` give `false`; everything else gives `true`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsWhenKeyboardAppears = true;
console.log(nav.hidesBarsWhenKeyboardAppears);
```

**Effect**: The console prints `true`. After that, the navigation bar hides when the keyboard appears. **The hiding effect is not verified in the simulator.**

## Corresponding iOS API

`UINavigationController.hidesBarsWhenKeyboardAppears`.

## See also

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md), [`hidesBarsOnTap`](hidesbarsontap.md), [`hidesBarsWhenKeyboardAppears`](hidesbarswhenkeyboardappears.md), [`hidesBarsWhenVerticallyCompact`](hidesbarswhenverticallycompact.md): the other ways to hide the navigation bar automatically
- [`isNavigationBarHidden`](isnavigationbarhidden.md): whether the navigation bar is hidden right now
