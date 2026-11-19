---
type: reference
native: "-[UIControl removeTarget:action:forControlEvents:]"
---

# `UIControl`: `removeEventListener()` method

The **`removeEventListener()`** method removes a callback registered with [`addEventListener()`](addeventlistener.md).

## Syntax

```
removeEventListener(type, callback)
```

### Parameters

**`type`**

The event name used when registering.

**`callback`**

The function used when registering. It must be the same function object; writing a new arrow function with the same body does not remove the original listener.

### Return value

None (`undefined`).

### Exceptions

None. For an event name and function that were never registered, it does nothing and does not throw.

## Examples

```js
const card = new UIControl();
const onTap = () => {
  console.log('Tapped');
};
card.addEventListener('touchupinside', onTap);
card.removeEventListener('touchupinside', onTap);
```

**Effect**: After removal, tapping `card` prints nothing.

## Corresponding iOS API

`-[UIControl removeTarget:action:forControlEvents:]`.

## See also

- [`addEventListener()`](addeventlistener.md)
