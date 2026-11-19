---
type: reference
native: UIApplication.backgroundRefreshStatus
---

# `Application`: `backgroundRefreshStatus` property

The **`backgroundRefreshStatus`** property indicates whether the app can refresh content in the background.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'available'` | The user allows background refresh |
| `'denied'` | The user turned off background refresh for this app in Settings |
| `'restricted'` | Prohibited by a device restriction policy, such as parental controls. The user can't change it |
| `'unknown'` | The system returned a value the runtime doesn't recognize. Not seen under normal conditions |

- Read-only. Assigning to it throws `TypeError`.
- Fires [`backgroundrefreshstatuschange`](backgroundrefreshstatuschange-event.md) when it changes.
- The specific values read are **not verified in the simulator**.

## Examples

```js
if (application.backgroundRefreshStatus !== 'available') {
  console.log('Background refresh unavailable');
}
```

**Result**: prints one line when background refresh is unavailable.

## Corresponding iOS API

`UIApplication.backgroundRefreshStatus`. `UIBackgroundRefreshStatusAvailable` is written as `'available'`, and likewise for the rest.

## See also

- [`backgroundrefreshstatuschange`](backgroundrefreshstatuschange-event.md)
