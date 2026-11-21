---
type: reference
native: application.network
---

# `Application`: `network` property

The **`network`** property is the entry point for the device's network status: whether it is connected to a network, which kind of network it uses, and whether that network is metered.

## Value

`Network`. For its properties and events, see [Network status](../network.md).

- Read-only. Assigning to it throws `TypeError`.
- Each read returns the same object.

## Examples

```js
console.log(application.network === application.network);
console.log(application.network.isConnected);
```

**Result**: the console first prints `true`. The second line prints `true` while the device is connected to a network.

## Corresponding iOS API

See [Network status](../network.md).

## See also

- [Network status](../network.md)
