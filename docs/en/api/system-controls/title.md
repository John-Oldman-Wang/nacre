---
type: reference
native: UIColorWell.title
---

# `UIColorWell`: `title` property

The **`title`** property is the title of the color picker panel. When the user opens the color well, this line of text appears at the top of the panel.

## Value

A string, or `null`.

- Readable and writable.
- Defaults to `null`: the panel has no custom title. What the panel shows when it's `null` is **not verified in the simulator**.
- The written title appears on the opened color picker panel (inspected in the simulator).
- Written values are converted with `String()`: writing `5` reads back `'5'`. Writing `null` gives `null`.
- No change event. Only the app's own code changes it.

## Examples

```js
const well = new UIColorWell();
well.title = 'Theme color';
console.log(well.title);
```

**Result**: prints `Theme color`. When the color picker panel is opened, its title is "Theme color".

## Corresponding iOS API

`UIColorWell.title`.

## See also

- [`selectedColor`](selectedcolor.md)
