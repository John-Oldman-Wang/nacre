---
type: reference
native: UITraitChangeEvent
---

# `UITraitChangeEvent`

**`UITraitChangeEvent`** represents a change in the set of values describing the UI's environment, such as dark mode being turned on or off, or the text size setting.

The `traitchange` event of [`UIView`](ui-view.md), [`UIViewController`](ui-view-controller.md), and [`UIWindowScene`](ui-window-scene.md) is this class. The set of values is a [`UITraitCollection`](ui-trait-collection.md). The event carries the set from before the change; read the current one from `event.target.traitCollection`.

**Inheritance**: [`Event`](event.md) → `UITraitChangeEvent`

## Constructor

[`UITraitChangeEvent()`](ui-trait-change-event/constructor.md)

Creates a `UITraitChangeEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`previousTraitCollection`](ui-trait-change-event/previoustraitcollection.md) <small>read-only</small> | The set of values before the change |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIView`](ui-view.md) and its subclasses | [`traitchange`](ui-view/traitchange-event.md) |
| [`UIViewController`](ui-view-controller.md) and its subclasses | [`traitchange`](ui-view-controller/traitchange-event.md) |
| [`UIWindowScene`](ui-window-scene.md) | [`traitchange`](ui-window-scene/traitchange-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const page = new UIViewController();
page.addEventListener('traitchange', (e) => {
  console.log(e instanceof UITraitChangeEvent, e.previousTraitCollection.userInterfaceStyle);
});
```

**Effect**: when the page's traits change, prints `true` and the style from before the change.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[view registerForTraitChanges:… withHandler:^(id env, UITraitCollection *previous) { … }]` | `view.addEventListener('traitchange', fn)` |
| `previousCollection` | `event.previousTraitCollection` |

## See also

- [`UITraitCollection`](ui-trait-collection.md): the set of values
- [Supporting Dark Mode](../guides/dark-mode.md)
