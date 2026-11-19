---
type: reference
native: "-[LAContext init]"
---

# `LAContext()` constructor

The **`LAContext()`** constructor creates a new authentication object. Settings such as button titles belong to this one object, so use a new one for each authentication.

## Syntax

```
new LAContext()
```

### Parameters

None.

### Return value

A new `LAContext`. Each call returns a different object. Its properties all have their default values: `localizedFallbackTitle` and `localizedCancelTitle` are `null`, `touchIDAuthenticationAllowableReuseDuration` is `0`, and `interactionNotAllowed` is `false`.

### Exceptions

**`TypeError`**

Subclassing `LAContext` and then calling `new`: native classes cannot be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const a = new LAContext();
const b = new LAContext();
console.log(a === b, a instanceof NSObject);
```

**Result**: Prints `false true`.

## Corresponding iOS API

`[[LAContext alloc] init]`.

## See also

- [`evaluatePolicy()`](evaluatepolicy.md): authenticating with this object
- [How one authentication proceeds](../la-context.md#how-one-authentication-proceeds)
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
