---
type: reference
native: "-[LAContext canEvaluatePolicy:error:]"
---

# `LAContext`: `canEvaluatePolicyError()` method

The **`canEvaluatePolicyError()`** method answers why authentication with a given policy is not possible. It returns synchronously and shows no UI.

Not being able to authenticate is a normal answer, so the reason is handed back as the return value rather than thrown.

## Syntax

```
canEvaluatePolicyError(policy)
```

### Parameters

**`policy`**

The policy, `'deviceOwnerAuthenticationWithBiometrics'` or `'deviceOwnerAuthentication'`; see [Policies](../la-context.md#policies).

### Return value

- `null` when [`canEvaluatePolicy()`](canevaluatepolicy.md) returns `true`.
- When it returns `false`, an `Error` object, a new one on each call. It is the same kind that `evaluatePolicy()` rejects with when authentication fails, carrying `name`, `message`, `code`, and `domain`; see [Reasons authentication failed](../la-context.md#reasons-authentication-failed). `message` is the system's explanation, such as `Biometry is not enrolled.`; `domain` is always `'com.apple.LocalAuthentication'`.

In this case `name` is one of the following:

| `name` | Meaning |
| --- | --- |
| `'BiometryNotAvailableError'` | The device does not support biometrics, or the user has not allowed this app to use Face ID |
| `'BiometryNotEnrolledError'` | The device supports it, but the user has not enrolled a face or fingerprint |
| `'BiometryLockoutError'` | Too many failures locked out biometrics; the passcode must be entered once first |
| `'PasscodeNotSetError'` | The device has no passcode set |
| `'InvalidContextError'` | `invalidate()` has been called on this object |

`BiometryNotEnrolledError` and `InvalidContextError` are verified in the simulator. The other three are listed from the system headers and are **not verified in the simulator**.

### Exceptions

**`TypeError`**

The policy is unrecognized, missing, or not a string:

```
canEvaluatePolicyError has no value "biometrics"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication
```

## Examples

```js
const context = new LAContext();
const error = context.canEvaluatePolicyError('deviceOwnerAuthenticationWithBiometrics');
console.log(error === null ? 'Can authenticate' : error.name);
```

**Result**: Prints `Can authenticate` when authentication is possible, and otherwise the name of the reason. On a simulator with no face enrolled, prints `BiometryNotEnrolledError`.

## Corresponding iOS API

The `error` out-parameter of `-[LAContext canEvaluatePolicy:error:]`. The return-value half is returned by [`canEvaluatePolicy()`](canevaluatepolicy.md).

## See also

- [Finding out why it cannot be used](../../guides/face-id.md#knowing-why-it-cannot-be-used)
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
