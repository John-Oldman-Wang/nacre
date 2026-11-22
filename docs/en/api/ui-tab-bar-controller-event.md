---
type: reference
native: UITabBarControllerEvent
---

# `UITabBarControllerEvent`

**`UITabBarControllerEvent`** represents the user selecting a page on the tab bar.

The [`tabselect`](ui-tab-bar-controller/tabselect-event.md) event of [`UITabBarController`](ui-tab-bar-controller.md) is this class, and [`viewController`](ui-tab-bar-controller-event/viewcontroller.md) is the page selected. It isn't fired when code changes the selected page.

**Inheritance**: [`Event`](event.md) → `UITabBarControllerEvent`

## Constructor

[`UITabBarControllerEvent()`](ui-tab-bar-controller-event/constructor.md)

Creates a `UITabBarControllerEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`viewController`](ui-tab-bar-controller-event/viewcontroller.md) <small>read-only</small> | The page the user selected |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UITabBarController`](ui-tab-bar-controller.md) | [`tabselect`](ui-tab-bar-controller/tabselect-event.md) |

It can't be canceled: `cancelable` is `false`. By the time it is fired, the switch is already done, so it can't keep the user from switching.

## Examples

```js
const tabs = new UITabBarController();
tabs.addEventListener('tabselect', (e) => {
  console.log(e instanceof UITabBarControllerEvent, e.viewController === tabs.selectedViewController);
});
```

**Effect**: when the user taps a tab to switch, prints `true true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `tabBarController:didSelectViewController:` | The `tabselect` event |
| The `viewController` parameter | `event.viewController` |

## See also

- [`UITabBarController`](ui-tab-bar-controller.md): the object that fires this event
- [`tabselect`](ui-tab-bar-controller/tabselect-event.md): when it is fired
