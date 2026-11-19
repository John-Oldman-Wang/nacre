---
type: reference
native: UIApplicationBackgroundRefreshStatusDidChangeNotification
---

# `Application`: `backgroundrefreshstatuschange` event

The **`backgroundrefreshstatuschange`** event fires when the user changes the background refresh setting.

## Syntax

```
application.addEventListener('backgroundrefreshstatuschange', (event) => { })
```

## Event object

`Event`, with only the basic fields. Read the new value from [`application.backgroundRefreshStatus`](backgroundrefreshstatus.md). Not cancelable.

## When it fires

- When the user changes this app's background refresh setting in Settings.
- Firing of this event is **not verified in the simulator**.

## Examples

```js
application.addEventListener('backgroundrefreshstatuschange', () => {
  console.log('Background refresh', application.backgroundRefreshStatus);
});
```

**Effect**: prints the new status after the user changes the setting. **Not verified in the simulator.**

## Corresponding iOS API

`UIApplicationBackgroundRefreshStatusDidChangeNotification`.

## See also

- [`backgroundRefreshStatus`](backgroundrefreshstatus.md)
