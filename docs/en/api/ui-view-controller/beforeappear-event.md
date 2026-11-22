---
type: reference
native: "-[UIViewController viewWillAppear:]"
---

# `UIViewController`: `beforeappear` event

The **`beforeappear`** event fires when the view controller's view is about to appear on screen.

## Syntax

```
page.addEventListener('beforeappear', (event) => { })
```

## Event object

[`UIViewControllerAppearanceEvent`](../ui-view-controller-appearance-event.md). Besides `type` and `target` (this view controller), it has one more read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`animated`](../ui-view-controller-appearance-event/animated.md) | `boolean` | Whether this appearance has a transition animation |

Not cancelable.

## When it fires

Every time the view controller's view is about to appear, not only the first time: when it is presented modally, when the navigation stack pops back to it, when the user switches back to its tab, and when a full-screen view controller covering it is dismissed. It does not fire when a sheet-style modal view controller covered it and then uncovers it. For all the cases and the order between two view controllers, see [Appearing and disappearing](../ui-view-controller.md#appearing-and-disappearing).

- On the same view controller, `beforeappear` comes before [`appear`](appear-event.md).
- A view controller that has never been shown on screen does not fire it.
- Put content that must be refreshed every time the user returns to the view controller here.

## Examples

```js
const page = new UIViewController();
page.addEventListener('beforeappear', (event) => {
  const { animated } = event;
  console.log('About to appear, animated: ' + animated);
});
```

**Effect**: Prints one line each time the view controller is about to appear: `true` when it appears with animation, `false` when it appears without.

## Corresponding iOS API

Overriding `-[UIViewController viewWillAppear:]`. Native classes cannot be subclassed, so here it is an event, and the callback runs a little later.

## See also

- [`appear`](appear-event.md)
- [`disappear`](disappear-event.md)
