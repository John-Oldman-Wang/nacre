---
type: reference
native: UIView.focusGroupIdentifier
---

# `UIView`: `focusGroupIdentifier` property

The **`focusGroupIdentifier`** property is the name of the focus group the view belongs to. When focus moves around the interface with a keyboard, elements in the same group are switched between together.

## Value

A string, or `null`.

- Readable and writable.
- The default is **not verified in the simulator**.
- Writing `null` or `undefined` gives `null`; other values are converted to strings.
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

## Examples

```js
const toolbar = new UIView();
toolbar.focusGroupIdentifier = 'toolbar';
console.log(toolbar.focusGroupIdentifier);
```

**Result**: Prints `toolbar`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.focusGroupIdentifier`.

## See also

- [`canBecomeFocused`](canbecomefocused.md)
