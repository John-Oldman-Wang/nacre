---
type: reference
native: "-[UIToolbar setItems:animated:]"
---

# `UIToolbar`: `setItems()` method

The **`setItems()`** method replaces the toolbar's items, optionally with animation.

## Syntax

```
setItems(items)
setItems(items, { animated })
```

### Parameters

**`items`**

An array of `UIBarButtonItem`, from left to right. `null` is the same as an empty array.

**`options.animated`**

A boolean, optional. When `true`, newly added items fade in, removed items fade out, and remaining items move to their new positions. When omitted or `false`, the items are replaced immediately, the same as writing [`items`](items.md) directly. How the animation looks is **not verified in the simulator**.

### Return value

None (`undefined`).

With animation, the `items` property already holds the new set when the call returns. There's no "animation finished" notification.

### Exceptions

**`TypeError`**

- `items` isn't an array: `setItems needs an array of UIBarButtonItem or null`.
- The array contains an element that isn't a `UIBarButtonItem`: `setItems needs an array of UIBarButtonItem`.

In both cases the existing items stay unchanged.

## Examples

```js
const toolbar = new UIToolbar();
const add = UIBarButtonItem.systemItem('add');
toolbar.items = [add, UIBarButtonItem.flexibleSpace(), UIBarButtonItem.systemItem('trash')];

toolbar.setItems([add, UIBarButtonItem.flexibleSpace()], { animated: true });
console.log(toolbar.items.length);
```

**Effect**: the trash can fades out. The console prints `2`.

## Corresponding iOS API

`-[UIToolbar setItems:animated:]`. `animated:` is written as `animated` in the options object.

## See also

- [`items`](items.md)
