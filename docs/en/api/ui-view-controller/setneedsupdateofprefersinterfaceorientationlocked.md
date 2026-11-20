---
type: reference
native: "-[UIViewController setNeedsUpdateOfPrefersInterfaceOrientationLocked]"
---

# `UIViewController`: `setNeedsUpdateOfPrefersInterfaceOrientationLocked()` method

The **`setNeedsUpdateOfPrefersInterfaceOrientationLocked()`** method tells the system that this view controller's orientation lock preference changed and asks it to query again.

## Syntax

```
setNeedsUpdateOfPrefersInterfaceOrientationLocked()
```

## Parameters

None.

## Return value

None (`undefined`).

## Exceptions

None.

## Description

The runtime already calls it when you write properties such as [`prefersInterfaceOrientationLocked`](prefersinterfaceorientationlocked.md), so you usually do not need to call it yourself.

## Examples

```js
const page = new UIViewController();
page.setNeedsUpdateOfPrefersInterfaceOrientationLocked();
```

**Result**: does not throw.

## Corresponding iOS API

`-[UIViewController setNeedsUpdateOfPrefersInterfaceOrientationLocked]`.

## See also

- [`prefersInterfaceOrientationLocked`](prefersinterfaceorientationlocked.md)
