---
type: reference
native: "-[UIView viewWithTag:]"
---

# `UIView`: `viewWithTag()` method

The **`viewWithTag()`** method searches the receiver and all its descendants for a view whose [`tag`](tag.md) equals the given value.

## Syntax

```
viewWithTag(tag)
```

### Parameters

**`tag`**

The tag to search for, an integer. Converted to an integer: `'7'` gives 7, and fractions are truncated toward zero.

### Return value

The `UIView` found, or `null` if none is found.

### Exceptions

**`TypeError`**

`tag` can't be converted to a finite number: `tag must be a finite number, got …`. **The name at the start of the message is not verified in the simulator.**

## Examples

```js
const page = new UIView();
const card = new UIView();
const dot = new UIView();
page.addSubview(card);
card.addSubview(dot);
dot.tag = 42;

const found = page.viewWithTag(42);
if (found) {
  found.backgroundColor = 'systemRed';
}
```

**Effect**: `dot` turns red.

## Corresponding iOS API

`-[UIView viewWithTag:]`.

## See also

- [`tag`](tag.md)
