---
type: reference
native: "-[UINavigationController popToViewController:animated:]"
---

# `UINavigationController`: `popToViewController()` method

The **`popToViewController()`** method pops all view controllers above a given one, making it the top of the stack.

## Syntax

```
popToViewController(viewController)
popToViewController(viewController, { animated })
```

### Parameters

**`viewController`**

The view controller to go back to; it must be in the stack. The result when it isn't in the stack is **not verified in the simulator**.

**`options.animated`**

A boolean, optional. `true` uses a transition animation; `false` or omitted switches directly.

### Return value

An array of the popped view controllers, those nearer the bottom first.

### Exceptions

**`TypeError`**

The argument isn't a view controller: `popToViewController: expects a UIViewController`.

## Examples

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
const a = new UIViewController();
const b = new UIViewController();
nav.pushViewController(a, { animated: false });
nav.pushViewController(b, { animated: false });

const gone = nav.popToViewController(home, { animated: false });
console.log(gone.length, gone[0] === a, gone[1] === b);
```

**Result**: The console prints `2 true true`. The screen goes back to the home view controller.

## Corresponding iOS API

`-[UINavigationController popToViewController:animated:]`.

## See also

- [`popToRootViewController()`](poptorootviewcontroller.md)
