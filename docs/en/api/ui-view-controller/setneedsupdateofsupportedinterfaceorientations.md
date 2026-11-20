---
type: reference
native: "-[UIViewController setNeedsUpdateOfSupportedInterfaceOrientations]"
---

# `UIViewController`: `setNeedsUpdateOfSupportedInterfaceOrientations()` method

The **`setNeedsUpdateOfSupportedInterfaceOrientations()`** method tells the system that this view controller's allowed orientations changed and asks it to query again.

## Syntax

```
setNeedsUpdateOfSupportedInterfaceOrientations()
```

## Parameters

None.

## Return value

None (`undefined`).

## Exceptions

None.

## Description

The runtime already calls it when you write properties such as [`supportedInterfaceOrientations`](supportedinterfaceorientations.md), so you usually do not need to call it yourself.

## Examples

```js
const page = new UIViewController();
page.setNeedsUpdateOfSupportedInterfaceOrientations();
```

**Result**: does not throw.

## Corresponding iOS API

`-[UIViewController setNeedsUpdateOfSupportedInterfaceOrientations]`.

## See also

- [`supportedInterfaceOrientations`](supportedinterfaceorientations.md)
