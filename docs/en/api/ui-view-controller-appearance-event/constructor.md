---
type: reference
native: UIViewControllerAppearanceEvent()
---

# `UIViewControllerAppearanceEvent()` constructor

The **`UIViewControllerAppearanceEvent()`** constructor creates a `UIViewControllerAppearanceEvent`.

## Syntax

```
new UIViewControllerAppearanceEvent(type)
new UIViewControllerAppearanceEvent(type, { animated, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.animated`**

Optional. Corresponds to the [`animated`](animated.md) property. Converted to its JS truthiness with `Boolean()`. When omitted, it is `false`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIViewControllerAppearanceEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIViewControllerAppearanceEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIViewControllerAppearanceEvent('appear', { animated: true });
console.log(event.type, event.animated);
```

**Result**: the console prints `appear true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIViewControllerAppearanceEvent`](../ui-view-controller-appearance-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
