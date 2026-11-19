---
type: reference
native: "-[UIViewController presentViewController:animated:completion:]"
---

# `UIViewController`: `presentViewController()` method

The **`presentViewController()`** method presents another view controller modally, on top of the current one.

## Syntax

```
presentViewController(viewController)
presentViewController(viewController, { animated })
```

### Parameters

**`viewController`**

The view controller to present, a `UIViewController`. The presentation style and animation are determined by [`modalPresentationStyle`](modalpresentationstyle.md) and [`modalTransitionStyle`](modaltransitionstyle.md) on **this view controller**, and must be set before the call.

**`options.animated`**

A boolean, optional. `true`: with an enter animation. `false` or omitted: appears immediately. Converted with `Boolean()`.

### Return value

`Promise<boolean>`. Fulfills with `true` after the enter animation ends.

Right after the call, [`presentedViewController`](presentedviewcontroller.md) is already the presented view controller; you do not need to wait for the Promise.

### Exceptions

**`TypeError`**

The first argument is a window not yet bound to a scene (the object you get from `new UIWindow()` with no arguments): `presentViewController: UIWindow has no native object yet, so it cannot be passed as an argument`.

The results in the following cases are **not verified in the simulator**; do not depend on them:

- Passing any other value as the first argument (`null`, a number, a plain object, a native object that is not a view controller).
- The view controller to present is already shown elsewhere, such as being a window's root view controller or already presented.
- This view controller has already presented a modal view controller and presents another before the first is dismissed.

## Description

- While presented, the presented view controller is kept by the caller; you do not need a variable to keep it alive.
- A view controller can present only one modal view controller at a time. To put another layer on top of a modal view controller, call `presentViewController()` on that modal view controller. **This form is not verified in the simulator.**
- When the view controller is on a navigation stack, the system hands the presentation to the navigation controller; see [`presentingViewController`](presentingviewcontroller.md).

## Examples

```js
const page = new UIViewController();
const sheet = new UIViewController();
sheet.view.backgroundColor = 'systemBackground';

async function openSheet() {
  await page.presentViewController(sheet, { animated: true });
  console.log(page.presentedViewController === sheet);
}
openSheet();
```

**Effect**: When `page` is the window's root view controller, `sheet` slides up from the bottom of the screen and covers `page`. After the animation ends, the console prints `true`.

## Corresponding iOS API

`-[UIViewController presentViewController:animated:completion:]`. The `completion` callback becomes the returned Promise.

## See also

- [`dismissViewController()`](dismissviewcontroller.md)
- [Modal presentation](../ui-view-controller.md#modal-presentation)
- [Presenting a modal view controller](../../guides/modal-pages.md)
