---
type: reference
native: UIView.focused
---

# `UIView`: `isFocused` property

The **`isFocused`** property indicates whether this view has focus right now.

## Value

A boolean. `true`: has focus right now. `false`: doesn't.

- Read-only; assigning to it throws `TypeError`.
- The type it reads back as is checked in the acceptance tests. The actual values and when they change are **not verified in the simulator**.

## Examples

```js
const view = new UIView();
console.log(view.isFocused);
```

**Result**: A new view prints `false`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.focused`; the ObjC getter name is `isFocused`.

## See also

- [`canBecomeFocused`](canbecomefocused.md)
