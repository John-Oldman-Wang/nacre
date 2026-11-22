---
type: reference
native: "-[UIViewController viewDidAppear:]"
---

# `UIViewController`: `appear` event

The **`appear`** event fires when the view controller's view has appeared on screen and the transition animation has finished.

## Syntax

```
page.addEventListener('appear', (event) => { })
```

## Event object

[`UIViewControllerAppearanceEvent`](../ui-view-controller-appearance-event.md). Besides `type` and `target` (this view controller), it has one more read-only field, [`animated`](../ui-view-controller-appearance-event/animated.md) (`boolean`): whether this appearance has a transition animation.

Not cancelable.

## When it fires

After [`beforeappear`](beforeappear-event.md), when the transition animation ends. It fires in the same situations as `beforeappear`; see [Appearing and disappearing](../ui-view-controller.md#appearing-and-disappearing).

Put things here that can only be done after the view controller is shown, such as focusing a text field automatically.

## Examples

```js
const page = new UIViewController();
const field = new UITextField();
page.view.addSubview(field);

page.addEventListener('appear', () => {
  field.becomeFirstResponder();
}, { once: true });
```

**Effect**: The first time the view controller is shown, after the transition animation ends, the text field starts editing and the keyboard comes up. Measured: calling `becomeFirstResponder()` in this callback returns `true`. `{ once: true }` makes it focus only on the first appearance; without it, the field is focused every time the user returns to this view controller.

## Corresponding iOS API

Overriding `-[UIViewController viewDidAppear:]`.

## See also

- [`beforeappear`](beforeappear-event.md)
