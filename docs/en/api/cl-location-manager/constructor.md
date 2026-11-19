---
type: reference
native: "-[CLLocationManager init]"
---

# `CLLocationManager()` constructor

The **`CLLocationManager()`** constructor creates a location entry point. Through it you request authorization, get the location, and receive location updates.

## Syntax

```
new CLLocationManager()
```

### Parameters

None.

### Return value

A new `CLLocationManager`. Each `new` gives a new object.

After creation, the system proactively fires [`authorizationchange`](authorizationchange-event.md) once to report the current authorization status. A listener receives this one only if it's added in the same synchronous code as `new CLLocationManager()`.

### Exceptions

**`TypeError`**

- Subclassing it: `class Mine extends CLLocationManager {}` throws on `new Mine()`, with a message starting with `Illegal constructor`. Native classes can't be subclassed.

## Description

- We recommend creating only one for the whole app and storing it in a variable at the module's top level.
- A `manager` that's continuously updating or has an unsettled Promise is kept alive by the runtime. At other times it's collected when no variable points to it; see [When a `manager` is garbage collected](../cl-location-manager.md#when-a-manager-is-garbage-collected).

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('authorizationchange', () => {
  console.log('Current authorization: ' + manager.authorizationStatus);
});
```

**Effect**: shortly after creation, prints a line such as `Current authorization: notDetermined`, and another line each time the authorization changes.

## Corresponding iOS API

`[[CLLocationManager alloc] init]`. There's no `delegate` to set; results come from Promises and events.

## See also

- [`authorizationchange`](authorizationchange-event.md): the first notification after creation
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
