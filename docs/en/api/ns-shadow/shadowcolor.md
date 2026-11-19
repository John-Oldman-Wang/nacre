---
type: reference
native: NSShadow.shadowColor
---

# `NSShadow`: `shadowColor` property

The **`shadowColor`** property is the shadow's color.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- The default is black at one-third opacity. The string form it reads back as is **not verified in the simulator**.
- After writing `null`, no shadow is drawn.
- Accepts a color string or a `UIColor` object on write.

### Invalid values

Writing an invalid color does not throw. The console prints a warning and the color keeps its previous value:

```
[Nacre] shadowColor: "#GGG" is not a valid color, ignored
```

## Examples

```js
const shadow = new NSShadow();
shadow.shadowColor = 'rgba(0, 0, 0, 0.4)';
console.log(shadow.shadowColor);
```

**Result**: The console prints `rgba(0, 0, 0, 0.4)`.

## Corresponding iOS API

`NSShadow.shadowColor`. In ObjC it is a `UIColor` object; here it is written as a string.

## See also

- [`UIColor`](../ui-color.md)
