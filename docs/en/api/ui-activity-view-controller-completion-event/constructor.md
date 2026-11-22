---
type: reference
native: UIActivityViewControllerCompletionEvent()
---

# `UIActivityViewControllerCompletionEvent()` constructor

The **`UIActivityViewControllerCompletionEvent()`** constructor creates a `UIActivityViewControllerCompletionEvent`.

## Syntax

```
new UIActivityViewControllerCompletionEvent(type)
new UIActivityViewControllerCompletionEvent(type, { activityType, completed, activityError, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.activityType`**

Optional. Corresponds to the [`activityType`](activitytype.md) property. Converted with `String()`; `null` stays `null`. When omitted, it is `null`.

**`options.completed`**

Optional. Corresponds to the [`completed`](completed.md) property. Converted to its JS truthiness with `Boolean()`. When omitted, it is `false`.

**`options.activityError`**

Optional. Corresponds to the [`activityError`](activityerror.md) property. Must be a `NSError` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIActivityViewControllerCompletionEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIActivityViewControllerCompletionEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIActivityViewControllerCompletionEvent('complete', { activityType: 'mail', completed: true });
console.log(event.activityType, event.completed, event.activityError);
```

**Result**: the console prints `mail true null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIActivityViewControllerCompletionEvent`](../ui-activity-view-controller-completion-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
