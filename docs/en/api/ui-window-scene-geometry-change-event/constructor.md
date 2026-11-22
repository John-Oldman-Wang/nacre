---
type: reference
native: UIWindowSceneGeometryChangeEvent()
---

# `UIWindowSceneGeometryChangeEvent()` constructor

The **`UIWindowSceneGeometryChangeEvent()`** constructor creates a `UIWindowSceneGeometryChangeEvent`.

## Syntax

```
new UIWindowSceneGeometryChangeEvent(type)
new UIWindowSceneGeometryChangeEvent(type, { previousInterfaceOrientation, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.previousInterfaceOrientation`**

Optional. Corresponds to the [`previousInterfaceOrientation`](previousinterfaceorientation.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is `'unknown'`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIWindowSceneGeometryChangeEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIWindowSceneGeometryChangeEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIWindowSceneGeometryChangeEvent('geometrychange', { previousInterfaceOrientation: 'portrait' });
console.log(event.previousInterfaceOrientation);
```

**Result**: the console prints `portrait`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIWindowSceneGeometryChangeEvent`](../ui-window-scene-geometry-change-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
