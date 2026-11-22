---
type: reference
native: UITraitChangeEvent()
---

# `UITraitChangeEvent()` constructor

The **`UITraitChangeEvent()`** constructor creates a `UITraitChangeEvent`.

## Syntax

```
new UITraitChangeEvent(type)
new UITraitChangeEvent(type, { previousTraitCollection, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.previousTraitCollection`**

Optional. Corresponds to the [`previousTraitCollection`](previoustraitcollection.md) property. Must be a `UITraitCollection` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UITraitChangeEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UITraitChangeEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const view = new UIView();
const event = new UITraitChangeEvent('traitchange', { previousTraitCollection: view.traitCollection });
console.log(event.previousTraitCollection === view.traitCollection);
```

**Result**: the console prints `true`. **Not verified in the simulator.**

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UITraitChangeEvent`](../ui-trait-change-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
