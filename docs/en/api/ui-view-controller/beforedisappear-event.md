---
type: reference
native: "-[UIViewController viewWillDisappear:]"
---

# `UIViewController`: `beforedisappear` event

The **`beforedisappear`** event fires when the view controller's view is about to leave the screen.

## Syntax

```
page.addEventListener('beforedisappear', (event) => { })
```

## Event object

`UIViewControllerAppearanceEvent`. Besides `type` and `target` (this view controller), it has one more read-only field, `animated` (`boolean`): whether this disappearance has a transition animation. For how to read it, see [`beforeappear`](beforeappear-event.md).

Not cancelable.

## When it fires

Every time the view controller's view is about to leave the screen: when it is covered by the next view controller, when a modal view controller is dismissed, when the user switches to another tab, and when a full-screen modal view controller covers it. It does not fire when a sheet-style modal view controller covers it; its view is still on screen. Leaving the screen does not mean the view controller is gone: a view controller covered by the next one is still on the navigation stack and appears again when the user goes back. See [Appearing and disappearing](../ui-view-controller.md#appearing-and-disappearing).

On the same view controller, `beforedisappear` comes before [`disappear`](disappear-event.md).

## Examples

```js
const page = new UIViewController();
page.addEventListener('beforedisappear', () => {
  console.log('About to leave the screen');
});
```

**Effect**: Prints one line each time the view controller is about to leave the screen.

## Corresponding iOS API

Overriding `-[UIViewController viewWillDisappear:]`.

## See also

- [`disappear`](disappear-event.md)
