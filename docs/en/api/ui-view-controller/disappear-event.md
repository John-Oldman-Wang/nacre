---
type: reference
native: "-[UIViewController viewDidDisappear:]"
---

# `UIViewController`: `disappear` event

The **`disappear`** event fires when the view controller's view has left the screen.

## Syntax

```
page.addEventListener('disappear', (event) => { })
```

## Event object

`UIViewControllerAppearanceEvent`. Besides `type` and `target` (this view controller), it has one more read-only field, `animated` (`boolean`): whether this disappearance has a transition animation. For how to read it, see [`beforeappear`](beforeappear-event.md).

Not cancelable.

## When it fires

After [`beforedisappear`](beforedisappear-event.md), when the view has left the screen. For the situations it fires in, see [Appearing and disappearing](../ui-view-controller.md#appearing-and-disappearing).

Timers and polling that should stop while the view controller is not visible are stopped here and restarted in [`beforeappear`](beforeappear-event.md).

## Examples

```js
const page = new UIViewController();
/** @type {number | undefined} */
let timer;

page.addEventListener('beforeappear', () => {
  timer = setInterval(() => console.log('Refresh'), 1000);
});
page.addEventListener('disappear', () => {
  clearInterval(timer);
});
```

**Effect**: While the view controller is on screen, `Refresh` is printed once a second. It stops after the view controller is covered by the next one, dismissed, or the user switches to another tab; it starts again when the user comes back to this view controller.

## Corresponding iOS API

Overriding `-[UIViewController viewDidDisappear:]`.

## See also

- [`beforedisappear`](beforedisappear-event.md)
