---
type: reference
native: "-[CAAnimationGroup init]"
---

# `CAAnimationGroup()` constructor

The **`CAAnimationGroup()`** constructor creates an empty animation group.

## Syntax

```
new CAAnimationGroup()
```

### Parameters

None.

### Return value

A new `CAAnimationGroup`. Its [`animations`](animations.md) is an empty array.

## Examples

```js
const group = new CAAnimationGroup();
console.log(group.animations.length);
```

**Result**: The console prints `0`.

## Corresponding iOS API

`[CAAnimationGroup animation]`.

## See also

- [`animations`](animations.md)
