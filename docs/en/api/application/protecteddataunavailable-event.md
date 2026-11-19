---
type: reference
native: UIApplicationProtectedDataWillBecomeUnavailable
---

# `Application`: `protecteddataunavailable` event

The **`protecteddataunavailable`** event fires when the device is about to lock and encrypted, protected files are about to become unreadable.

## Syntax

```
application.addEventListener('protecteddataunavailable', (event) => { })
```

## Event object

`Event`, with only the basic fields. Read the new value from [`application.protectedDataAvailable`](protecteddataavailable.md). Not cancelable.

## When it fires

- When the device is about to lock.
- Firing of this event is **not verified in the simulator**.

## Examples

```js
application.addEventListener('protecteddataunavailable', () => {
  console.log('Encrypted files about to become unreadable');
});
```

**Effect**: prints one line before the device locks. **Not verified in the simulator.**

## Corresponding iOS API

`UIApplicationProtectedDataWillBecomeUnavailable`.

## See also

- [`protecteddataavailable`](protecteddataavailable-event.md)
