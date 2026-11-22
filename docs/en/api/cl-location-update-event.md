---
type: reference
native: CLLocationUpdateEvent
---

# `CLLocationUpdateEvent`

**`CLLocationUpdateEvent`** represents the system reporting new locations.

The [`locationupdate`](cl-location-manager/locationupdate-event.md) event of [`CLLocationManager`](cl-location-manager.md) is this class, and [`locations`](cl-location-update-event/locations.md) is the locations reported this time.

It belongs to the `@nacrejs/core-location` package; for installation, see [`CLLocationManager`](cl-location-manager.md#installation).

**Inheritance**: [`Event`](event.md) → `CLLocationUpdateEvent`

## Constructor

[`CLLocationUpdateEvent()`](cl-location-update-event/constructor.md)

Creates a `CLLocationUpdateEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`locations`](cl-location-update-event/locations.md) <small>read-only</small> | The locations reported this time; the last one is the latest |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`CLLocationManager`](cl-location-manager.md) | [`locationupdate`](cl-location-manager/locationupdate-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  console.log(e instanceof CLLocationUpdateEvent, e.locations.length);
});
manager.requestLocation();
```

**Effect**: when a location is obtained, prints `true` and the number of locations reported.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `locationManager:didUpdateLocations:` | The `locationupdate` event |
| The `locations` parameter | `event.locations` |

## See also

- [`CLLocationManager`](cl-location-manager.md): the object that fires this event
- [`CLLocation`](cl-location.md)
