---
type: reference
native: UINavigationItem.hidesBackButton
---

# `UINavigationItem`: `hidesBackButton` property

The **`hidesBackButton`** property determines whether the back button is shown while this view controller is at the top of the navigation stack.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The back button is not shown. Swipe back is also unavailable |
| `false` | The back button is shown when the stack has more than one view controller |

- Readable and writable.
- The default is `false`.
- Non-boolean values are converted with `Boolean(v)` on write.
- The effect on screen and the disabling of swipe back are **not verified in the simulator**.
- No event fires when it changes: only code changes it.

> **Note:** By iOS's rules, once the back button is hidden, swipe back is also unavailable. The view controller must then provide another way back, such as a button that calls `popViewController()`; otherwise the user cannot leave it.

## Examples

```js
const page = new UIViewController();
page.navigationItem.hidesBackButton = true;
console.log(page.navigationItem.hidesBackButton);
```

**Result**: The console prints `true`. While `page` is at the top of the stack, there is no back button on the left of the navigation bar. **Not verified in the simulator.**

## Corresponding iOS API

`UINavigationItem.hidesBackButton`.

## See also

- [Left buttons and going back](../ui-navigation-item.md#left-buttons-and-going-back)
- [`leftBarButtonItems`](leftbarbuttonitems.md)
