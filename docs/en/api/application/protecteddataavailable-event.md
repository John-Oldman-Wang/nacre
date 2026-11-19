---
type: reference
native: UIApplicationProtectedDataDidBecomeAvailable
---

# `Application`: `protecteddataavailable` event

The **`protecteddataavailable`** event fires when the device is unlocked and encrypted, protected files can be read.

## Syntax

```
application.addEventListener('protecteddataavailable', (event) => { })
```

## Event object

`Event`, with only the basic fields. Read the new value from [`application.protectedDataAvailable`](protecteddataavailable.md). Not cancelable.

## When it fires

- After the device is unlocked.
- Firing of this event is **not verified in the simulator**.

## Examples

```js
application.addEventListener('protecteddataavailable', () => {
  console.log('Encrypted files readable', application.protectedDataAvailable);
});
```

**Effect**: prints `Encrypted files readable true` after the device is unlocked. **Not verified in the simulator.**

## Corresponding iOS API

`UIApplicationProtectedDataDidBecomeAvailable`.

## See also

- [`protecteddataunavailable`](protecteddataunavailable-event.md)
