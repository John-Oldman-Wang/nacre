---
type: reference
native: ATTrackingManager.trackingAuthorizationStatus
---

# `ATTrackingManager.trackingAuthorizationStatus` static property

The **`ATTrackingManager.trackingAuthorizationStatus`** static property is the user's answer to "may this app track me", that is, the current authorization state. Reading it does not show the alert.

## Value

A string, one of these four. For what each value means and whether asking now shows the alert, see [The four authorization states](../app-tracking-transparency.md#the-four-authorization-states):

| Value | Meaning |
| --- | --- |
| `'notDetermined'` | The user has not answered yet |
| `'restricted'` | The device is restricted, and the system does not allow the app to ask |
| `'denied'` | The user declined |
| `'authorized'` | The user agreed |

- Read-only; assigning to it throws `TypeError`, and the state does not change.
- There is no default value; the system records it. When the app runs for the first time and has never asked, it is `'notDetermined'` (**not verified in the simulator**).
- It can be read at any time, including at the top level of a script. Reading it at the top level of a script is **not verified in the simulator**.

### Observing changes

There is no event for state changes: the system does not provide this notification.

- Changes caused by a request come from the Promise of [`requestTrackingAuthorization()`](requesttrackingauthorization.md).
- Changes the user makes in the system Settings: the user has to leave the app to go to Settings, so reading it again when the app becomes active (the `active` event of [`application`](../application.md)) gets the new value.

## Examples

```js
const status = ATTrackingManager.trackingAuthorizationStatus;
console.log(status);
```

**Effect**: The console prints one of the four states, such as `notDetermined`. No alert is shown.

```js
let last = ATTrackingManager.trackingAuthorizationStatus;

application.addEventListener('active', () => {
  const now = ATTrackingManager.trackingAuthorizationStatus;
  if (now !== last) {
    console.log('Authorization state changed from ' + last + ' to ' + now);
    last = now;
  }
});
```

**Effect**: When the user switches to the system Settings, changes authorization for this app, and switches back, the console prints a line such as `Authorization state changed from authorized to denied`. If nothing changed, nothing is printed. **Not verified in the simulator.**

## Corresponding iOS API

`ATTrackingManager.trackingAuthorizationStatus`. `ATTrackingManagerAuthorizationStatusNotDetermined` is written `'notDetermined'`, and likewise for the rest.

## See also

- [`requestTrackingAuthorization()`](requesttrackingauthorization.md): asking for authorization
- [Re-reading the state on return to the foreground](../../guides/tracking-authorization.md#re-read-the-status-when-returning-to-the-foreground)
- [Installing `@nacrejs/app-tracking-transparency`](../app-tracking-transparency.md#installation)
