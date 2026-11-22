---
type: reference
native: CLLocationErrorEvent
---

# `CLLocationErrorEvent`

**`CLLocationErrorEvent`** represents a location error.

The [`locationerror`](cl-location-manager/locationerror-event.md) event of [`CLLocationManager`](cl-location-manager.md) is this class, and [`error`](cl-location-error-event/error.md) is the error.

It belongs to the `@nacrejs/core-location` package; for installation, see [`CLLocationManager`](cl-location-manager.md#installation).

**Inheritance**: [`Event`](event.md) → `CLLocationErrorEvent`

## Constructor

[`CLLocationErrorEvent()`](cl-location-error-event/constructor.md)

Creates a `CLLocationErrorEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`error`](cl-location-error-event/error.md) <small>read-only</small> | The error |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`CLLocationManager`](cl-location-manager.md) | [`locationerror`](cl-location-manager/locationerror-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationerror', (e) => {
  console.log(e instanceof CLLocationErrorEvent, e.error.name);
});
manager.startUpdatingLocation();
```

**Effect**: when a location error occurs, prints `true` and the error category. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `locationManager:didFailWithError:` | The `locationerror` event |
| The `error` parameter | `event.error` |

## See also

- [`CLLocationManager`](cl-location-manager.md): the object that fires this event
- [`CLLocationError`](cl-location-error.md)
