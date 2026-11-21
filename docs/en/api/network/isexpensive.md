---
type: reference
native: nw_path_is_expensive
---

# `Network`: `isExpensive` property

The **`isExpensive`** property indicates whether the network the device is using at this moment is metered, such as cellular data or a personal hotspot shared from a phone.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | The system considers this network metered. It is `true` when using cellular data or connected to a personal hotspot |
| `false` | Not metered, such as ordinary Wi-Fi. It is also `false` when not connected to a network |

- Read-only. Assigning to it throws `TypeError`.
- Each read gives the status at that moment.
- The system decides which networks count as metered; the app cannot change it.
- On the simulator used for acceptance it reads `false`. The `true` case and the value when not connected are **not verified in the simulator**.

### Observing changes

When it changes, [`application.network`](../network.md) fires [`change`](change-event.md).

## Examples

```js
const network = application.network;
const quality = network.isExpensive ? 'low' : 'high';
console.log('Image quality:', quality);
```

**Effect**: prints `Image quality: high` on Wi-Fi and `Image quality: low` on cellular data. On the simulator used for acceptance, it prints `Image quality: high`; the output on cellular data is **not verified in the simulator**.

## Corresponding iOS API

`nw_path_is_expensive()` in the Network framework. In Swift, it is `path.isExpensive` from `NWPathMonitor`.

## See also

- [`isConnected`](isconnected.md), [`type`](type.md)
- [`change`](change-event.md)
