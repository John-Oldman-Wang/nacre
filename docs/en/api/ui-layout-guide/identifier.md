---
type: reference
native: UILayoutGuide.identifier
---

# `UILayoutGuide`: `identifier` property

The **`identifier`** property is a name given to the layout guide, used only to identify it when debugging.

## Value

A string.

- Readable and writable.
- The default value is **not verified in the simulator**.
- Writing `null` or `undefined` gives `''`; other values are converted to strings. Unlike a constraint's [`identifier`](../auto-layout/identifier.md), it is never `null`.

## Examples

```js
const spacer = new UILayoutGuide();
spacer.identifier = 'spacer';
console.log(spacer.identifier);
```

**Result**: logs `spacer`.

## Corresponding iOS API

`UILayoutGuide.identifier`.

## See also

- [`NSLayoutConstraint.identifier`](../auto-layout/identifier.md)
