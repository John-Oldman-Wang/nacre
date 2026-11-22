---
type: reference
native: "-[LAContext evaluatePolicy:localizedReason:reply:]"
---

# `LAContext`: `evaluatePolicy()` method

The **`evaluatePolicy()`** method starts authentication. The system shows the authentication UI, and the method immediately returns a Promise that fulfills when authentication succeeds.

## Syntax

```
evaluatePolicy(policy, { localizedReason })
```

### Parameters

**`policy`**

The policy, `'deviceOwnerAuthenticationWithBiometrics'` or `'deviceOwnerAuthentication'`; see [Policies](../la-context.md#policies).

**`options.localizedReason`**

Why authentication is needed, a sentence shown to the user. A string; required; must not be empty. Values that are not strings are converted with `String()`.

- The Touch ID and passcode screens show it.
- The Face ID UI usually does not show it; it is shown only when [`localizedFallbackTitle`](localizedfallbacktitle.md) is set.
- The UI's title is the app's name, so the sentence does not need to repeat it.

How it appears in the UI is **not verified in the simulator**.

### Return value

`Promise<true>`.

- Fulfills with `true` on success. It never fulfills with `false`.
- Rejects on failure with an [`NSError`](../ns-error.md) carrying `name`, `code`, and `domain`; see [Reasons authentication failed](../la-context.md#reasons-authentication-failed).
- An object that has had [`invalidate()`](invalidate.md) called: rejects with `InvalidContextError`, and the system UI does not appear.
- [`interactionNotAllowed`](interactionnotallowed.md) is `true` and authentication needs UI: rejects with `NotInteractiveError`.

While the authentication UI is shown, the app's code keeps running and timers keep firing.

### Exceptions

**`TypeError`**

Thrown on the spot for invalid arguments; no Promise is returned and the system UI does not appear:

| Situation | Error message |
| --- | --- |
| Unrecognized policy | `evaluatePolicy has no value "faceID"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication` |
| No `options`, `options` is `null`, or it has no `localizedReason` (a value of `undefined` also counts as missing) | `evaluatePolicy needs options.localizedReason` |
| `localizedReason` is an empty string or `null` | `evaluatePolicy: localizedReason must not be empty` |

## Examples

```js
const context = new LAContext();
try {
  await context.evaluatePolicy('deviceOwnerAuthentication', {
    localizedReason: 'View card number',
  });
  console.log('Passed');
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  console.log('Did not pass: ' + failure.name);
}
```

**Effect** (**not verified in the simulator**): The system shows the authentication UI. On success, prints `Passed`; if the user taps Cancel, prints `Did not pass: UserCancelError`; if the device has no passcode set, no UI is shown and it prints `Did not pass: PasscodeNotSetError`.

## Corresponding iOS API

`-[LAContext evaluatePolicy:localizedReason:reply:]`. The `reply` callback is replaced with a Promise: `success == YES` is fulfillment and `NO` is rejection with an `NSError`; `err.code` and `err.domain` are `error.code` and `error.domain`, and `err.message` is `error.localizedDescription`.

## See also

- [Invalid arguments versus failed authentication](../la-context.md#invalid-arguments-versus-failed-authentication)
- [Confirming identity with Face ID](../../guides/face-id.md): handling each reason, falling back to the app's own password
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
