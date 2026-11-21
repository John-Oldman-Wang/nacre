---
type: reference
native: "nw_path_get_status == nw_path_status_satisfied"
---

# `Network`: `isConnected` property

The **`isConnected`** property indicates whether the device is connected to a network at this moment.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | The device has a network that can be used to establish connections. [`type`](type.md) is a value other than `'none'` |
| `false` | No network is available, for example when neither Wi-Fi nor cellular data is available. `type` is `'none'` |

- Read-only. Assigning to it throws `TypeError`.
- Each read gives the status at that moment.
- `true` does not guarantee that any particular server can be reached: requests can still fail.
- `isConnected` and `type` always agree: when `isConnected` is `false`, `type` is `'none'`, and the other way around (the acceptance suite checks the values at the time).
- On the simulator used for acceptance it reads `true`. Reading `false` when the network is down is **not verified in the simulator**.

### Observing changes

When it changes, [`application.network`](../network.md) fires [`change`](change-event.md).

## Examples

```js
const network = application.network;
if (!network.isConnected) {
  console.log('No network');
}
network.addEventListener('change', () => {
  console.log(network.isConnected ? 'Connected' : 'Disconnected');
});
```

**Effect**: if there is no network at launch, prints `No network`. Later, when the network comes up or goes down, prints `Connected` or `Disconnected`; when the network only switches kind and stays connected, prints `Connected`. The output on disconnecting and connecting is **not verified in the simulator**.

## Corresponding iOS API

In the Network framework, `nw_path_get_status(path)` equals `nw_path_status_satisfied`. In Swift, it is `path.status == .satisfied` from `NWPathMonitor`.

## See also

- [`type`](type.md), [`isExpensive`](isexpensive.md)
- [`change`](change-event.md)
