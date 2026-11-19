---
type: reference
native: UIView.canBecomeFocused
---

# `UIView`: `canBecomeFocused` property

The **`canBecomeFocused`** property indicates whether this view can get focus. Focus is the currently selected element when moving around the interface with a keyboard or remote.

## Value

A boolean. `true`: can get focus. `false`: can't.

- Read-only; assigning to it throws `TypeError`.
- The type it reads back as is checked in the acceptance tests. The actual values and when they change are **not verified in the simulator**.

## Examples

```js
const view = new UIView();
console.log(typeof view.canBecomeFocused);
```

**Result**: Prints `boolean`.

## Corresponding iOS API

`UIView.canBecomeFocused`. In ObjC, subclasses override it to decide whether they can get focus; here it can only be read.

## See also

- [`isFocused`](isfocused.md)
- [`focusGroupIdentifier`](focusgroupidentifier.md)
