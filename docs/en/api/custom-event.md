---
type: reference
web: CustomEvent
---

# `CustomEvent`

**`CustomEvent`** represents an event that carries a piece of custom data. The data is in [`detail`](custom-event/detail.md).

Every event a [native module](native-module.md) fires is one, and `detail` is the data the native side passed. An app can also fire a `CustomEvent` on any [`EventTarget`](event-target.md) to hand data to its listeners.

**Inheritance**: [`Event`](event.md) → `CustomEvent`

## Constructor

[`CustomEvent()`](custom-event/constructor.md)

Creates a `CustomEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`detail`](custom-event/detail.md) <small>read-only</small> | The data the event carries |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`NativeModule`](native-module.md) | All the events listed in the module's [`events`](native-module/events.md) |

Events from a native module can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const example = application.nativeModules.get('example');
example.addEventListener('tick', (e) => {
  console.log(e instanceof CustomEvent, JSON.stringify(e.detail));
});
example.call('emit', 'tick', { n: 1 });
```

**Effect**: after the `example` module fires `tick`, the console prints `true {"n":1}`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `CustomEvent` in the browser. A native module fires an event on the native side with `emitEvent:detail:`, and that `detail` is the [`detail`](custom-event/detail.md) here.

## See also

- [`NativeModule`](native-module.md): the object that fires these events
- [`addEventListener()`](native-module/addeventlistener.md): listening for a native module's events
- [`Event`](event.md): the base class
