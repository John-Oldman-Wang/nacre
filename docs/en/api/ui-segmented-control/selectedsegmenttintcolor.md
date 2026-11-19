---
type: reference
native: UISegmentedControl.selectedSegmentTintColor
---

# `UISegmentedControl`: `selectedSegmentTintColor` property

The **`selectedSegmentTintColor`** property is the color of the highlight behind the selected segment.

## Value

A color string, or `null`.

- Readable and writable.
- The default is `null`: the system default color.
- Accepts a color string (`'#007aff'`, `'systemBlue'`) or a `UIColor` object; a written string reads back exactly as written.
- Writing `null` returns to the system default color.
- How the color looks on screen is **not verified in the simulator**.

### Invalid values

Writing an unrecognized color does not throw: the console logs a warning, and the property keeps its previous value. For how to write colors, see [Colors](../ui-color.md).

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week']);
seg.selectedSegmentIndex = 0;
seg.selectedSegmentTintColor = '#007aff';
console.log(seg.selectedSegmentTintColor);
```

**Result**: logs `#007aff`. The highlight behind the selected segment is blue. **How the color looks is not verified in the simulator.**

## Corresponding iOS API

`UISegmentedControl.selectedSegmentTintColor`; the native type is `UIColor`.

## See also

- [Colors](../ui-color.md)
