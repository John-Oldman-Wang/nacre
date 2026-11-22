---
type: reference
native: PHPickerViewControllerFinishEvent()
---

# `PHPickerViewControllerFinishEvent()` constructor

The **`PHPickerViewControllerFinishEvent()`** constructor creates a `PHPickerViewControllerFinishEvent`.

## Syntax

```
new PHPickerViewControllerFinishEvent(type)
new PHPickerViewControllerFinishEvent(type, { results, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.results`**

Optional. Corresponds to the [`results`](results.md) property. Must be iterable (an array, a `Set`, …); it is copied into a new frozen array. Anything else throws `TypeError`. When omitted, it is a frozen empty array.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `PHPickerViewControllerFinishEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'PHPickerViewControllerFinishEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new PHPickerViewControllerFinishEvent('pick');
console.log(event.results.length, Object.isFrozen(event.results));
```

**Result**: the console prints `0 true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`PHPickerViewControllerFinishEvent`](../ph-picker-view-controller-finish-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
