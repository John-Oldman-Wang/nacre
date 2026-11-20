---
type: reference
native: "-[UIViewController setNeedsStatusBarAppearanceUpdate]"
---

# `UIViewController`: `setNeedsStatusBarAppearanceUpdate()` method

The **`setNeedsStatusBarAppearanceUpdate()`** method tells the system that this view controller's status bar appearance changed and asks it to query again.

## Syntax

```
setNeedsStatusBarAppearanceUpdate()
```

## Parameters

None.

## Return value

None (`undefined`).

## Exceptions

None.

## Description

The runtime already calls it when you write properties such as [`prefersStatusBarHidden`](prefersstatusbarhidden.md), so you usually do not need to call it yourself.

## Examples

```js
const page = new UIViewController();
page.setNeedsStatusBarAppearanceUpdate();
```

**Result**: does not throw.

## Corresponding iOS API

`-[UIViewController setNeedsStatusBarAppearanceUpdate]`.

## See also

- [`prefersStatusBarHidden`](prefersstatusbarhidden.md)
