---
type: reference
native: UIColorWell.selectedColor
---

# `UIColorWell`: `selectedColor` property

The **`selectedColor`** property is the color well's selected color. Both the control and the color picker panel show this color.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- Defaults to `null`: no selected color.
- Validly written colors read back unchanged: writing `'#ff0000'` reads back `'#ff0000'`, and writing `'systemBlue'` reads back `'systemBlue'`.
- Writing `null` removes the selected color and reads back `null`.
- The written color appears as the current color in the opened color picker panel (inspected in the simulator).
- Writing this property in code doesn't fire [`change`](../ui-control/change-event.md).
- After the user picks a color in the panel, this property becomes the user's color and `change` fires. **Not verified in the simulator.** The form of the string you read for the user's color is also **not verified in the simulator**.

### Invalid values

Writing an invalid color doesn't throw: the console prints a warning, and the color keeps its previous value. See [Colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const well = new UIColorWell();
well.selectedColor = 'systemOrange';
console.log(well.selectedColor);
well.addEventListener('change', () => {
  console.log('User picked', well.selectedColor);
});
```

**Result**: first prints `systemOrange`. After the user picks a color in the panel, prints `User picked` and the color; **not verified in the simulator**.

## Corresponding iOS API

`UIColorWell.selectedColor`. In ObjC it's a `UIColor` object; here it's a color string.

## See also

- [The `change` event](../ui-control/change-event.md)
- [Colors](../ui-color.md): how to write color strings
