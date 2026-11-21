---
type: reference
---

# `application.network`

**`application.network`** represents the device's network status at this moment: whether it is connected to a network, which kind of network it uses, and whether that network is metered. When any of the three changes, it fires the [`change`](network/change-event.md) event.

There is only one `application.network` in the whole app, and it can be used at any time, including at the top level of a script. Its class is `Network`. All three properties are read-only, and each read gives the status at that moment.

"Connected" means the device has a network that can be used to establish connections. It does not guarantee that any particular server can be reached: while `isConnected` is `true`, [`fetch()`](fetch.md) can still fail, and when it does, the Promise returned by `fetch()` is rejected.

In the simulator, the network status follows the Mac running the simulator.

**Inheritance**: [`EventTarget`](event-target.md) → `NSObject` → `Network`

## Constructor

Cannot be created with `new`: `new Network()` throws `TypeError` with the message `Illegal constructor: Network is created by the runtime, not by new`. The only instance is obtained from the [`network`](application/network.md) property of [`application`](application.md).

## Instance properties

| Property | Description |
| --- | --- |
| [`isConnected`](network/isconnected.md) <small>read-only</small> | Whether a network is connected |
| [`type`](network/type.md) <small>read-only</small> | Which kind of network is in use: `'wifi'`, `'cellular'`, `'wired'`, `'other'`, or `'none'` when not connected |
| [`isExpensive`](network/isexpensive.md) <small>read-only</small> | Whether the network is metered, such as cellular data or a personal hotspot |

## Instance methods

Inherits [`addEventListener()`](event-target/addeventlistener.md), [`removeEventListener()`](event-target/removeeventlistener.md), and [`dispatchEvent()`](event-target/dispatchevent.md) from [`EventTarget`](event-target.md), used to listen for the event below.

## Events

| Event | When it fires |
| --- | --- |
| [`change`](network/change-event.md) | One of `isConnected`, `type`, or `isExpensive` changed |

`change` is the only event `application.network` fires. Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

## Examples

Network status involves no UI, so this code runs as is at the top level of `main.js`.

```js
const network = application.network;
console.log('Connected:', network.isConnected, 'Type:', network.type, 'Metered:', network.isExpensive);

network.addEventListener('change', () => {
  console.log('Network changed, now', network.type);
});
```

**Result**

- At launch, one line with the current status is printed. On the simulator used for acceptance, it reads `Connected: true Type: wifi Metered: false`.
- Later, when the network goes down, comes up, or switches, `Network changed, now` is printed with the new type. **Not verified in the simulator.**

## Corresponding iOS API

On iOS, network status comes from `nw_path_monitor` in the Network framework (`NWPathMonitor` in Swift). It is not an ObjC class; `Network` and its members are defined by Nacre.

| iOS | JS |
| --- | --- |
| `nw_path_monitor_create()`, `nw_path_monitor_start()` | Not needed. Read `application.network` directly |
| `nw_path_get_status(path) == nw_path_status_satisfied` | `network.isConnected` |
| `nw_path_uses_interface_type(path, nw_interface_type_wifi)` and so on | `network.type` |
| `nw_path_is_expensive(path)` | `network.isExpensive` |
| `nw_path_monitor_set_update_handler()` | `network.addEventListener('change', …)` |

### Comparison with the browser

This table is only for people familiar with the web to look up correspondences; the rest of the page does not depend on it.

| Web | `application.network` |
| --- | --- |
| `navigator.onLine` | `isConnected` |
| `navigator.connection.type` | `type` |
| The `online` and `offline` events | The `change` event; read `isConnected` in the callback |

## See also

- [`application`](application.md): `network` is one of its properties
- [`fetch()`](fetch.md): sending requests. A request can still fail while `isConnected` is `true`
- [`WebSocket`](websocket.md): a persistent connection has its own `close` event when it drops
