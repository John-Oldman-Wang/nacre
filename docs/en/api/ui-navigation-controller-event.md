---
type: reference
native: UINavigationControllerEvent
---

# `UINavigationControllerEvent`

**`UINavigationControllerEvent`** represents a navigation controller about to show, or having shown, a page.

The [`beforeshow`](ui-navigation-controller/beforeshow-event.md) and [`show`](ui-navigation-controller/show-event.md) events of [`UINavigationController`](ui-navigation-controller.md) are this class, and [`viewController`](ui-navigation-controller-event/viewcontroller.md) is that page. Both pushing and going back fire them; no field on the event tells which one happened.

**Inheritance**: [`Event`](event.md) → `UINavigationControllerEvent`

## Constructor

[`UINavigationControllerEvent()`](ui-navigation-controller-event/constructor.md)

Creates a `UINavigationControllerEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`viewController`](ui-navigation-controller-event/viewcontroller.md) <small>read-only</small> | The page about to be shown, or just shown |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UINavigationController`](ui-navigation-controller.md) | [`beforeshow`](ui-navigation-controller/beforeshow-event.md), [`show`](ui-navigation-controller/show-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect, so it can't keep the user from going back.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.addEventListener('show', (e) => {
  console.log(e instanceof UINavigationControllerEvent, e.viewController === nav.topViewController);
});
nav.pushViewController(new UIViewController(), { animated: true });
```

**Effect**: after the pushed page is shown, prints `true true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `navigationController:willShowViewController:animated:` | `beforeshow` |
| `navigationController:didShowViewController:animated:` | `show` |
| The `viewController` parameter | `event.viewController` |

## See also

- [`UINavigationController`](ui-navigation-controller.md): the object that fires these events
