---
type: reference
native: UIColorWell.supportsAlpha
---

# `UIColorWell`: `supportsAlpha` property

The **`supportsAlpha`** property determines whether the color's opacity can be adjusted in the color picker panel.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The panel has an opacity slider (inspected in the simulator) |
| `false` | The panel has no opacity slider, and the chosen color is opaque. **Not verified in the simulator** |

- Readable and writable.
- Defaults to `true`.
- Written values are converted to booleans by JS truthiness: writing `0` gives `false`. It never throws.
- No change event. Only the app's own code changes it.

## Examples

```js
const well = new UIColorWell();
well.supportsAlpha = false;
console.log(well.supportsAlpha);
```

**Result**: prints `false`.

## Corresponding iOS API

`UIColorWell.supportsAlpha`.

## See also

- [`UIColorWell`](../system-controls.md)
