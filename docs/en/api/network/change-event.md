---
type: reference
native: nw_path_monitor_set_update_handler
---

# `Network`: `change` event

The **`change`** event fires after the network status changes: one of [`isConnected`](isconnected.md), [`type`](type.md), or [`isExpensive`](isexpensive.md) changed.

## Syntax

```
application.network.addEventListener('change', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (`application.network`) and does not carry the new status. Not cancelable.

## When it fires

- **The event does not say which one changed.** Read the three properties in the callback to get the status after the change.
- It does not fire when none of the three changed. For example, switching from one Wi-Fi network to another leaves all three unchanged, so there is no event.
- Getting the first network status when the app launches does not count as a change and does not fire.
- Fires after the change, once the current JS finishes running. A callback is never called in the middle of reading a property.
- Does not fire when there are no listeners. The properties can still be read for the latest status at any time.
- Listening for `change` does not throw; this is verified in the acceptance suite. Whether the event fires when the network goes down, comes up, or switches kind is **not verified in the simulator**: the simulator follows the network of the Mac running it, and the acceptance run cannot change the network.

## Examples

```js
const network = application.network;
const onChange = () => {
  console.log('Network changed:', network.isConnected, network.type, network.isExpensive);
};
network.addEventListener('change', onChange);
```

**Effect**: when Wi-Fi is turned off and the device switches to cellular data, prints one line `Network changed: true cellular true`. **Not verified in the simulator.**

When it is no longer needed, remove it with `network.removeEventListener('change', onChange)`.

## Corresponding iOS API

`nw_path_monitor_set_update_handler()` in the Network framework. The system calls that handler each time it reports a new network path; here `change` fires only when one of the three values changed.

## See also

- [`isConnected`](isconnected.md), [`type`](type.md), [`isExpensive`](isexpensive.md)
- [`application.network`](../network.md)
