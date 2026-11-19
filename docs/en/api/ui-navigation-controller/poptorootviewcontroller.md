---
type: reference
native: "-[UINavigationController popToRootViewControllerAnimated:]"
---

# `UINavigationController`: `popToRootViewController()` method

The **`popToRootViewController()`** method pops all view controllers except the bottom one, and the screen goes back to the bottom view controller.

## Syntax

```
popToRootViewController()
popToRootViewController({ animated })
```

### Parameters

**`options.animated`**

A boolean, optional. `true` uses a transition animation; `false` or omitted switches directly.

### Return value

An array of the popped view controllers, those nearer the bottom first. An empty array if already at the bottom.

### Exceptions

None.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
const a = new UIViewController();
const b = new UIViewController();
nav.pushViewController(a, { animated: false });
nav.pushViewController(b, { animated: false });

const gone = nav.popToRootViewController({ animated: false });
console.log(gone.length, gone[0] === a, gone[1] === b);
```

**Result**: The console prints `2 true true`.

## Corresponding iOS API

`-[UINavigationController popToRootViewControllerAnimated:]`.

## See also

- [`popToViewController()`](poptoviewcontroller.md)
