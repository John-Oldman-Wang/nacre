---
type: reference
native: LAContext.touchIDAuthenticationAllowableReuseDuration
---

# `LAContext`: `touchIDAuthenticationAllowableReuseDuration` property

The **`touchIDAuthenticationAllowableReuseDuration`** property is a duration, in seconds. If the user unlocked the screen with Face ID or Touch ID within this period, authentication succeeds right away without showing the authentication UI.

It counts only the biometric authentication used to unlock the screen, not earlier authentications in this app or other apps. Despite `touchID` in the name, it applies to Face ID as well.

## Value

A number, in seconds.

- Readable and writable.
- The default is `0`, meaning no reuse: every authentication shows the UI.
- The system honors at most 300 seconds. Writing a larger value does not throw and has the same effect as 300.
- Only the app itself can change it, so there is no change notification.
- The reuse behavior is **not verified in the simulator**.

### Invalid values

Written values are converted with `Number()`, so writing `'30'` reads back `30`. The following two cases throw `TypeError`, and the property keeps its previous value:

- Cannot be converted to a finite number (`'soon'`, `undefined`, `NaN`): `touchIDAuthenticationAllowableReuseDuration must be a finite number, got "soon"`.
- A negative number: `touchIDAuthenticationAllowableReuseDuration must not be negative`.

## Examples

```js
const context = new LAContext();
context.touchIDAuthenticationAllowableReuseDuration = 10;
await context.evaluatePolicy('deviceOwnerAuthenticationWithBiometrics', {
  localizedReason: 'Open the shop',
});
```

**Effect**: If the user unlocked the screen with Face ID or Touch ID within the last 10 seconds, authentication succeeds right away without showing the UI; after more than 10 seconds, the UI is shown as usual. **Not verified in the simulator.**

## Corresponding iOS API

`LAContext.touchIDAuthenticationAllowableReuseDuration`. The system's maximum allowed value, `LATouchIDAuthenticationMaximumAllowableReuseDuration`, is not provided.

## See also

- [`evaluatePolicy()`](evaluatepolicy.md)
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
