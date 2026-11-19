---
type: reference
native: "-[LAContext invalidate]"
---

# `LAContext`: `invalidate()` method

The **`invalidate()`** method invalidates this object. Any authentication in progress ends with it, and the object can no longer be used to authenticate.

## Syntax

```
invalidate()
```

### Parameters

None.

### Return value

None (`undefined`).

After the call:

- An authentication in progress ends, and its Promise rejects with `AppCancelError` (**not verified in the simulator**).
- Calling `evaluatePolicy()` again rejects the Promise with `InvalidContextError`, and the system UI does not appear.
- `canEvaluatePolicy()` returns `false`, and `canEvaluatePolicyError()` returns the reason `InvalidContextError`.
- `biometryType` can still be read.

### Exceptions

None. Calling it twice on the same object does not throw.

## Examples

```js
const context = new LAContext();
const pending = context.evaluatePolicy('deviceOwnerAuthentication', {
  localizedReason: 'Confirm payment',
});
setTimeout(() => { context.invalidate(); }, 30000);
try {
  await pending;
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  console.log(failure.name);
}
```

**Effect** (**not verified in the simulator**): If the user has not finished authenticating within 30 seconds, the authentication UI closes and the console prints `AppCancelError`.

```js
const context = new LAContext();
context.invalidate();
console.log(context.canEvaluatePolicy('deviceOwnerAuthentication'));
```

**Result**: Prints `false`.

## Corresponding iOS API

`-[LAContext invalidate]`.

## See also

- [`LAContext()`](constructor.md): creating a new one after invalidating
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
