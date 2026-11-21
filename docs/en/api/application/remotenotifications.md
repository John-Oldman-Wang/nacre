---
type: reference
native: application.remoteNotifications
---

# `Application`: `remoteNotifications` property

The **`remoteNotifications`** property is the entry point for remote notifications: registering with Apple, getting the device token, and receiving silent pushes. **It only exists in projects that install `@nacrejs/push`.**

## Value

A [`RemoteNotifications`](../remote-notifications.md). For its members, see [`RemoteNotifications`](../remote-notifications.md).

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object (measured).
- Without `@nacrejs/push` installed, the property doesn't exist: `'remoteNotifications' in application` is `false`, and the types don't include it either.
- After installing it, add the line `/// <reference types="@nacrejs/push" />` at the top of the entry file so the types include it.

## Examples

```js
/// <reference types="@nacrejs/push" />
console.log('remoteNotifications' in application);
```

**Result**: prints `true` in projects with `@nacrejs/push` installed, and `false` in projects without it.

## Corresponding iOS API

The members of `UIApplication` for registering for remote notifications, and the app delegate methods that report the results; see [`RemoteNotifications`](../remote-notifications.md#corresponding-ios-api).

## See also

- [`RemoteNotifications`](../remote-notifications.md)
- [Remote notifications](../../guides/push-notifications.md)
- [Capability packages](../capabilities.md): available only when installed
