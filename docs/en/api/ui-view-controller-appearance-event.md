---
type: reference
native: UIViewControllerAppearanceEvent
---

# `UIViewControllerAppearanceEvent`

**`UIViewControllerAppearanceEvent`** represents a view controller about to appear, having appeared, about to disappear, or having disappeared.

The four appearance events of [`UIViewController`](ui-view-controller.md) are this class, and [`animated`](ui-view-controller-appearance-event/animated.md) tells whether this transition is animated.

**Inheritance**: [`Event`](event.md) → `UIViewControllerAppearanceEvent`

## Constructor

[`UIViewControllerAppearanceEvent()`](ui-view-controller-appearance-event/constructor.md)

Creates a `UIViewControllerAppearanceEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`animated`](ui-view-controller-appearance-event/animated.md) <small>read-only</small> | Whether this appearance or disappearance is animated |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIViewController`](ui-view-controller.md) and its subclasses | [`beforeappear`](ui-view-controller/beforeappear-event.md), [`appear`](ui-view-controller/appear-event.md), [`beforedisappear`](ui-view-controller/beforedisappear-event.md), [`disappear`](ui-view-controller/disappear-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const page = new UIViewController();
page.addEventListener('appear', (e) => {
  console.log(e instanceof UIViewControllerAppearanceEvent, e.animated);
});
```

**Effect**: each time the page has appeared, prints `true` and whether it was animated.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `viewWillAppear:` | `beforeappear` |
| `viewDidAppear:` | `appear` |
| `viewWillDisappear:` | `beforedisappear` |
| `viewDidDisappear:` | `disappear` |
| The `animated` parameter | `event.animated` |

## See also

- [`UIViewController`](ui-view-controller.md): the object that fires these events
