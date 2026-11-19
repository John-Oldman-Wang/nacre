---
type: reference
native: UITabBarController.tabBarMinimizeBehavior
---

# `UITabBarController`: `tabBarMinimizeBehavior` property

The **`tabBarMinimizeBehavior`** property determines whether the tab bar shrinks to a small strip when the view controller's content scrolls, making room for the content.

## Value

A string. None of the four effects is **verified in the simulator**; the descriptions come from Apple's documentation:

| Value | Effect |
| --- | --- |
| `'automatic'` | The system decides |
| `'never'` | The tab bar is always shown in full |
| `'onScrollDown'` | Shrinks when content scrolls down, restores when it scrolls up |
| `'onScrollUp'` | Shrinks when content scrolls up, restores when it scrolls down |

- Readable and writable.
- Defaults to `'automatic'`.
- No event fires when it changes: only code changes it.

### Invalid values

Writing a value not in the table does not throw; the property keeps its previous value, and the console logs a warning: `[Nacre] tabBarMinimizeBehavior has no value "always"; expected one of: automatic / never / onScrollDown / onScrollUp, ignored`.

## Examples

```js
const tabs = new UITabBarController();
tabs.tabBarMinimizeBehavior = 'onScrollDown';
console.log(tabs.tabBarMinimizeBehavior);
```

**Effect**: the console logs `onScrollDown`. When the content in the view controller scrolls down, the tab bar shrinks to a small strip; when it scrolls up, it restores. **Not verified in the simulator.**

## Corresponding iOS API

`UITabBarController.tabBarMinimizeBehavior`. `UITabBarMinimizeBehaviorOnScrollDown` is written `'onScrollDown'`, and likewise for the others.

## See also

- [`isTabBarHidden`](istabbarhidden.md)
