---
type: reference
native: "-[UIViewController dismissViewControllerAnimated:completion:]"
---

# `UIViewController`: `dismissViewController()` method

The **`dismissViewController()`** method dismisses a modal view controller.

## Syntax

```
dismissViewController()
dismissViewController({ animated })
```

### Parameters

**`options.animated`**

A boolean, optional. `true`: with an exit animation. `false` or omitted: disappears immediately.

### Return value

`Promise<boolean>`. Fulfills with `true` after the exit animation ends.

### Exceptions

None.

## Description

- Called on the presented view controller (`sheet.dismissViewController()`), it dismisses itself.
- Called on the presenting view controller (`page.dismissViewController()`), it dismisses the view controller that one presented. **This form is not verified in the simulator.**
- The result of calling it on a view controller that is neither presented modally nor presenting anything is **not verified in the simulator**.
- **It fires no events, including [`beforedismiss`](beforedismiss-event.md) and [`dismiss`](dismiss-event.md).** Put whatever must happen after dismissal at the call site, after the Promise fulfills.
- After dismissal, if no variable holds the dismissed view controller, it is collected after the animation ends (verified by testing).

## Examples

```js
const page = new UIViewController();
const sheet = new UIViewController();

async function closeSheet() {
  await sheet.dismissViewController({ animated: true });
  console.log(page.presentedViewController);
}
```

**Effect**: Calling `closeSheet()` while `page` is presenting `sheet` slides `sheet` down off the screen, revealing `page`. After the animation ends, the console prints `null`.

## Corresponding iOS API

`-[UIViewController dismissViewControllerAnimated:completion:]`. The `completion` callback becomes the returned Promise.

## See also

- [`presentViewController()`](presentviewcontroller.md)
- [Dismissal events](../ui-view-controller.md#dismissal-events)
