---
type: reference
native: "-[UINavigationController popViewControllerAnimated:]"
---

# `UINavigationController`: `popViewController()` method

The **`popViewController()`** method pops the top view controller, and the screen goes back to the previous one.

## Syntax

```
popViewController()
popViewController({ animated })
```

### Parameters

**`options.animated`**

A boolean, optional. `true` uses a transition animation; `false` or omitted switches directly.

### Return value

The popped view controller. When the stack holds only one view controller, nothing is popped and it returns `null`. The bottom view controller can't be popped; this isn't an error.

### Exceptions

None.

## Description

- If no other variable holds the popped view controller, it is collected; if you keep the return value, it stays in memory and can be pushed again.
- Whether [`show`](show-event.md) fires when popping this way has no separate record and is **not verified in the simulator**.

## Examples

```js
const home = new UIViewController();
home.title = 'Home';
const nav = new UINavigationController(home);

const popped = nav.popViewController({ animated: true });
console.log(popped === null ? 'already at the bottom' : popped.title);
```

**Result**: The stack holds only the home view controller, so nothing happens and the console prints `already at the bottom`. When the stack holds more than one view controller, the screen goes back to the previous one and the console prints the popped view controller's title.

## Corresponding iOS API

`-[UINavigationController popViewControllerAnimated:]`.

## See also

- [`popToViewController()`](poptoviewcontroller.md)
- [`popToRootViewController()`](poptorootviewcontroller.md)
