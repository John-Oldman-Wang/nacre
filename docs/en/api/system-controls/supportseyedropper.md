---
type: reference
native: UIColorWell.supportsEyedropper
---

# `UIColorWell`: `supportsEyedropper` property

The **`supportsEyedropper`** property determines whether the color picker panel has an eyedropper. An eyedropper is a tool for picking a color from the screen.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The panel has an eyedropper button (inspected in the simulator) |
| `false` | The panel has no eyedropper button. **Not verified in the simulator** |

- Readable and writable.
- Defaults to `true`.
- Written values are converted to booleans by JS truthiness: writing `0` gives `false`. It never throws.
- No change event. Only the app's own code changes it.

## Examples

```js
const well = new UIColorWell();
well.supportsEyedropper = false;
console.log(well.supportsEyedropper);
```

**Result**: prints `false`.

## Corresponding iOS API

`UIColorWell.supportsEyedropper`.

## See also

- [`UIColorWell`](../system-controls.md)
