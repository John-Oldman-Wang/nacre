---
type: reference
native: "-[CLLocationManagerDelegate locationManagerDidChangeAuthorization:]"
---

# `CLLocationManager`: `authorizationchange` event

The **`authorizationchange`** event fires when the authorization status or precision changes. It also fires once after the `manager` is created.

## Syntax

```
manager.addEventListener('authorizationchange', (event) => { })
```

## Event object

`Event`, with no extra fields. Read the current state from the `manager`: [`authorizationStatus`](authorizationstatus.md) and [`accuracyAuthorization`](accuracyauthorization.md).

Not cancelable. `target` is the `manager`.

## When it fires

- After `new CLLocationManager()`, the system proactively reports the current status once, whatever it is. A listener receives this one only if it's added in the same synchronous code as the `new`; listeners added later receive only subsequent changes.
- After the user makes a choice in the prompt. **Not verified in the simulator.**
- After the user changes the authorization or precision in the system Settings app. **Not verified in the simulator.**
- The callback runs on the turn after the system's notification.

A `manager` with only this listener attached and nothing else going on is collected when no variable points to it, and the listener disappears with it. To keep receiving this event, store the `manager` in a long-lived variable.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('authorizationchange', () => {
  console.log(manager.authorizationStatus, manager.accuracyAuthorization);
});
```

**Effect**: prints a line right after creation, such as `notDetermined fullAccuracy`, and another line each time something changes.

## Corresponding iOS API

The delegate method `locationManagerDidChangeAuthorization:`.

## See also

- [`requestWhenInUseAuthorization()`](requestwheninuseauthorization.md): asking the user
- [When a `manager` is garbage collected](../cl-location-manager.md#when-a-manager-is-garbage-collected)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
