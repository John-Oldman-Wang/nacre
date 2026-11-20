---
type: reference
native: UIApplicationDidReceiveMemoryWarningNotification
---

# `Application`: `memorywarning` event

The **`memorywarning`** event fires when the device is low on memory.

## Syntax

```
application.addEventListener('memorywarning', (event) => { })
```

## Event object

`Event`. `target` is `application`. Not cancelable; `cancelable` is `false` (verified by testing).

## When it fires

- When the device is low on memory, the system first notifies each app to release memory; the event fires at that point.
- To trigger it in the simulator, choose Simulate Memory Warning from the Device menu (verified by testing).
- The callback runs later; see [How the runtime works](../how-it-works.md#events).

At this point the app should discard data it can get back: cached images, data that's already parsed but can be parsed again, view controllers that aren't on screen. The runtime doesn't discard any data that JS still holds; the app's code decides what to release. After all listeners have run, the runtime has the JS engine reclaim memory: objects the listeners let go of, and that nothing else references, are reclaimed at that point (verified by testing). Not handling this event doesn't cause an error. If memory is still insufficient, the system terminates the app, with no notification. **"Not releasing memory gets the app terminated" comes from iOS's definitions and is not verified in the simulator.**

## Examples

```js
/** @type {Map<string, string>} */
const cache = new Map();

application.addEventListener('memorywarning', () => {
  cache.clear();
  console.log('Cache cleared');
});
```

**Effect**: when the system sends a memory warning, the console prints `Cache cleared`.

## Corresponding iOS API

`UIApplicationDidReceiveMemoryWarningNotification`.

## See also

- [Handling the app lifecycle](../../guides/app-lifecycle.md#release-caches-on-a-memory-warning)
