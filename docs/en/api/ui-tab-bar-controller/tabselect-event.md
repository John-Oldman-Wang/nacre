---
type: reference
native: "-[UITabBarControllerDelegate tabBarController:didSelectViewController:]"
---

# `UITabBarController`: `tabselect` event

The **`tabselect`** event fires when the user taps a tab.

## Syntax

```
tabs.addEventListener('tabselect', (event) => { })
```

## Event object

`UITabBarControllerEvent`, with one extra field:

| Field | Type | Meaning |
| --- | --- | --- |
| `viewController` | `UIViewController` | The view controller tapped |

The listener callback's parameter type is `Event`; to read `viewController`, cast it first, as shown in the example.

Not cancelable. When it fires the switch has already happened; you cannot use it to prevent the user from switching.

## When it fires

- Fires when the user taps a tab.
- **Does not fire when code changes [`selectedIndex`](selectedindex.md) or [`selectedViewController`](selectedviewcontroller.md)** (measured: two consecutive writes, neither received). For work that must happen in both cases, write a function and call it yourself after switching from code; see the guide's [Recommended approach](../../guides/tabs.md#recommended-approach).
- Whether it fires when the user taps the tab that is already selected is **not verified in the simulator**.
- The callback does not run synchronously at the moment of the tap but a little later; see [How the runtime works](../how-it-works.md).

## Examples

```js
const tabs = new UITabBarController();
tabs.addEventListener('tabselect', (e) => {
  const event = /** @type {UITabBarControllerEvent} */ (e);
  console.log(event.type, event.target === tabs, event.viewController === tabs.selectedViewController);
});
```

**Effect**: each time the user taps a tab, logs `tabselect true true`.

## Corresponding iOS API

`tabBarController:didSelectViewController:` of `UITabBarControllerDelegate`.

## See also

- [Knowing when the selection changes](../ui-tab-bar-controller.md#knowing-when-the-selection-changes)
