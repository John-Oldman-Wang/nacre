---
type: reference
native: SceneEvent()
---

# `SceneEvent()` constructor

The **`SceneEvent()`** constructor creates a `SceneEvent`.

## Syntax

```
new SceneEvent(type)
new SceneEvent(type, { scene, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.scene`**

Optional. Corresponds to the [`scene`](scene.md) property. Must be a `UIWindowScene` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `SceneEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'SceneEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new SceneEvent('sceneconnect');
console.log(event.type, event.scene);
```

**Result**: the console prints `sceneconnect null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`SceneEvent`](../scene-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
