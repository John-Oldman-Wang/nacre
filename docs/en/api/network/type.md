---
type: reference
native: nw_path_uses_interface_type
---

# `Network`: `type` property

The **`type`** property indicates which kind of network the device is using at this moment.

## Value

A string, one of five values:

| Value | Meaning |
| --- | --- |
| `'wifi'` | Using Wi-Fi |
| `'cellular'` | Using cellular data |
| `'wired'` | Using a wired network, for example an Ethernet cable plugged in through an adapter |
| `'other'` | Connected to a network, but not one of the three above |
| `'none'` | Not connected to a network. This is the value whenever [`isConnected`](isconnected.md) is `false` |

- Read-only. Assigning to it throws `TypeError`.
- Each read gives the status at that moment.
- When the network uses several kinds at once, the first one in use in the order `'wifi'`, `'cellular'`, `'wired'` is given.
- `type` being `'none'` and `isConnected` being `false` always hold together.
- On the simulator used for acceptance it reads `'wifi'`. The values `'cellular'`, `'wired'`, `'other'`, and `'none'` are **not verified in the simulator**.

### Observing changes

When it changes, [`application.network`](../network.md) fires [`change`](change-event.md).

## Examples

```js
const network = application.network;
const label = new UILabel();
function showType() {
  label.text = network.type === 'none' ? 'No network' : 'Network: ' + network.type;
}
showType();
network.addEventListener('change', showType);
```

**Effect**: `label` shows the current network, such as `Network: wifi`; it updates when the network switches, and shows `No network` when the network goes down. At launch, on the simulator used for acceptance, it shows `Network: wifi`; the updates are **not verified in the simulator**.

## Corresponding iOS API

`nw_path_uses_interface_type()` in the Network framework, called with `nw_interface_type_wifi`, `nw_interface_type_cellular`, and `nw_interface_type_wired` in turn. In Swift, it is `path.usesInterfaceType(_:)` from `NWPathMonitor`.

## See also

- [`isConnected`](isconnected.md), [`isExpensive`](isexpensive.md)
- [`change`](change-event.md)
