---
type: reference
native: "-[LAContext canEvaluatePolicy:error:]"
---

# `LAContext`: `canEvaluatePolicy()` method

The **`canEvaluatePolicy()`** method answers whether authentication with a given policy is possible right now. It returns synchronously and shows no UI.

## Syntax

```
canEvaluatePolicy(policy)
```

### Parameters

**`policy`**

The policy, `'deviceOwnerAuthenticationWithBiometrics'` or `'deviceOwnerAuthentication'`; see [Policies](../la-context.md#policies).

### Return value

A boolean.

- `true`: the system can start authentication when `evaluatePolicy()` is called.
- `false`: it cannot start, for one of the reasons in the "When authentication is not possible" column of the [Policies](../la-context.md#policies) table. To find out which, ask [`canEvaluatePolicyError()`](canevaluatepolicyerror.md).
- An object that has had [`invalidate()`](invalidate.md) called returns `false`.

The result can change: the user can enroll or delete a face in the system Settings at any time. Ask when you are about to use it.

### Exceptions

**`TypeError`**

The policy is unrecognized, missing, or not a string:

```
canEvaluatePolicy has no value "biometrics"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication
```

## Examples

```js
const context = new LAContext();
console.log(context.canEvaluatePolicy('deviceOwnerAuthenticationWithBiometrics'));
console.log(context.canEvaluatePolicy('deviceOwnerAuthentication'));
```

**Result**: Prints two booleans. On a simulator with no face enrolled and no passcode set, the first line is `false`.

## Corresponding iOS API

The return value of `-[LAContext canEvaluatePolicy:error:]`. The `error` out-parameter is returned by [`canEvaluatePolicyError()`](canevaluatepolicyerror.md).

## See also

- [`canEvaluatePolicyError()`](canevaluatepolicyerror.md): why it is not possible
- [Checking whether biometrics can be used right now](../../guides/face-id.md#checking-whether-biometrics-can-be-used-now)
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
