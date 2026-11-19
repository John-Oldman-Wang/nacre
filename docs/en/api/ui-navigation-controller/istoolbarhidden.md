---
type: reference
native: UINavigationController.toolbarHidden
---

# `UINavigationController`: `isToolbarHidden` property

The **`isToolbarHidden`** property determines whether the toolbar at the bottom of the screen is hidden. The toolbar is the one managed by the navigation controller itself; see [`toolbar`](toolbar.md).

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The toolbar is hidden |
| `false` | The toolbar is shown at the bottom of the screen. **Not verified in the simulator** |

- Readable and writable.
- The default is `true`: a new navigation controller has no toolbar.
- Writing it isn't animated. For an animation, use [`setToolbarHidden()`](settoolbarhidden.md).
- No event fires when it changes. Changes made by code don't need a notification; when [`hidesBarsOnSwipe`](hidesbarsonswipe.md) or a similar option is on, the system also hides the toolbar, and there is no event then either.

### Invalid values

Doesn't throw. The written value is converted by JS truthiness: `0`, `''`, `null`, and `undefined` give `false`; everything else gives `true`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.isToolbarHidden = false;
console.log(nav.isToolbarHidden);
```

**Effect**: A toolbar appears at the bottom of the screen. The console prints `false`. **The toolbar appearing is not verified in the simulator.**

## Corresponding iOS API

`UINavigationController.toolbarHidden`. In JS it is called `isToolbarHidden`.

## See also

- [`setToolbarHidden()`](settoolbarhidden.md)
- [`toolbar`](toolbar.md)
