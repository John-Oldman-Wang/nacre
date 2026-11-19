---
type: reference
native: UINavigationController.hidesBarsWhenVerticallyCompact
---

# `UINavigationController`: `hidesBarsWhenVerticallyCompact` property

The **`hidesBarsWhenVerticallyCompact`** property automatically hides the navigation bar and toolbar when vertical space is tight. Tight vertical space means the vertical size class in the traits is `compact`, for example when an iPhone is turned sideways.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The navigation bar and toolbar hide when vertical space is tight and reappear when it is restored. **Not verified in the simulator** |
| `false` | Doesn't hide them because of the screen height |

- Readable and writable.
- The default is `false`.
- No event fires when the system hides the navigation bar; read [`isNavigationBarHidden`](isnavigationbarhidden.md) to know whether it is hidden right now. This property itself only changes through code.

### Invalid values

Doesn't throw. The written value is converted by JS truthiness: `0`, `''`, `null`, and `undefined` give `false`; everything else gives `true`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsWhenVerticallyCompact = true;
console.log(nav.hidesBarsWhenVerticallyCompact);
```

**Effect**: The console prints `true`. **The hiding effect is not verified in the simulator.**

## Corresponding iOS API

`UINavigationController.hidesBarsWhenVerticallyCompact`.

## See also

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md), [`hidesBarsOnTap`](hidesbarsontap.md), [`hidesBarsWhenKeyboardAppears`](hidesbarswhenkeyboardappears.md), [`hidesBarsWhenVerticallyCompact`](hidesbarswhenverticallycompact.md): the other ways to hide the navigation bar automatically
- [`isNavigationBarHidden`](isnavigationbarhidden.md): whether the navigation bar is hidden right now
