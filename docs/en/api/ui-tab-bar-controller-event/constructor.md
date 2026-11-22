---
type: reference
native: UITabBarControllerEvent()
---

# `UITabBarControllerEvent()` constructor

The **`UITabBarControllerEvent()`** constructor creates a `UITabBarControllerEvent`.

## Syntax

```
new UITabBarControllerEvent(type)
new UITabBarControllerEvent(type, { viewController, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.viewController`**

Optional. Corresponds to the [`viewController`](viewcontroller.md) property. Must be a `UIViewController` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UITabBarControllerEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UITabBarControllerEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const page = new UIViewController();
const event = new UITabBarControllerEvent('tabselect', { viewController: page });
console.log(event.viewController === page);
```

**Result**: the console prints `true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UITabBarControllerEvent`](../ui-tab-bar-controller-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
