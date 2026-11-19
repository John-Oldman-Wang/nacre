---
type: reference
native: LAContext.interactionNotAllowed
---

# `LAContext`: `interactionNotAllowed` property

The **`interactionNotAllowed`** property decides what happens when authentication needs to show UI: show the UI, or show nothing and fail right away.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `false` | When authentication needs UI, it is shown as usual |
| `true` | When authentication needs UI, nothing is shown, and the Promise from `evaluatePolicy()` rejects with `NotInteractiveError` |

- Readable and writable.
- The default is `false`.
- Only the app itself can change it, so there is no change notification.
- After setting it to `true`, authenticating in the simulator rejects the Promise with `name` `NotInteractiveError`; when the simulator has no passcode set, it is `PasscodeNotSetError`. Behavior on a device is **not verified**.

### Invalid values

Does not throw. Written values are converted by truthiness: `0` gives `false`; `'false'` is a non-empty string and gives `true`.

## Examples

```js
const context = new LAContext();
context.interactionNotAllowed = true;
try {
  await context.evaluatePolicy('deviceOwnerAuthentication', { localizedReason: 'Silent check' });
  console.log('Passed');
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  console.log(failure.name);
}
```

**Effect**: No authentication UI is shown. When authentication would need UI, prints `NotInteractiveError`.

## Corresponding iOS API

`LAContext.interactionNotAllowed`.

## See also

- [Reasons authentication failed](../la-context.md#reasons-authentication-failed)
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
