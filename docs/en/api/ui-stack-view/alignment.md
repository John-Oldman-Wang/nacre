---
type: reference
native: UIStackView.alignment
---

# `UIStackView`: `alignment` property

The **`alignment`** property determines how the arranged subviews are aligned on the cross axis (perpendicular to the direction of arrangement).

## Value

A string, one of:

| Value | Horizontal arrangement | Vertical arrangement | Name read back |
| --- | --- | --- | --- |
| `'fill'` | All items as tall as the stack view | All items as wide as the stack view | `'fill'` |
| `'leading'` | Top edges aligned | Leading edges aligned | `'leading'` |
| `'top'` | Same as `'leading'` | Same as `'leading'` | `'leading'` |
| `'center'` | Centered vertically | Centered horizontally | `'center'` |
| `'trailing'` | Bottom edges aligned | Trailing edges aligned | `'trailing'` |
| `'bottom'` | Same as `'trailing'` | Same as `'trailing'` | `'trailing'` |
| `'firstBaseline'` | Baselines of the first line of text aligned | No effect | `'firstBaseline'` |
| `'lastBaseline'` | Baselines of the last line of text aligned | No effect | `'lastBaseline'` |

- Readable and writable.
- The default is `'fill'`. With any other value, each item is shown at its own size, and a plain `UIView` with no intrinsic size needs constraints to give its size on the cross axis.
- No change notification. Only the app's own code can change it.

### What each value looks like

All of the diagrams below are horizontal arrangements with three items of different heights.

`'fill'` (the default): all items are stretched to the height of the stack view.

```
┌───────────────┐
│┌───┐┌───┐┌───┐│
││ A ││ B ││ C ││
││   ││   ││   ││
│└───┘└───┘└───┘│
└───────────────┘
```

`'leading'`, alias `'top'`: top edges aligned. Each item is shown at its own height.

```
┌───────────────┐
│┌───┐┌───┐┌───┐│
││ A ││ B ││ C ││
│└───┘│   │└───┘│
│     └───┘     │
└───────────────┘
```

`'center'`: center lines aligned.

```
┌───────────────┐
│     ┌───┐     │
│┌───┐│   │┌───┐│
││ A ││ B ││ C ││
│└───┘│   │└───┘│
│     └───┘     │
└───────────────┘
```

`'trailing'`, alias `'bottom'`: bottom edges aligned.

```
┌───────────────┐
│     ┌───┐     │
│┌───┐│   │┌───┐│
││ A ││ B ││ C ││
│└───┘└───┘└───┘│
└───────────────┘
```

`'firstBaseline'`: the baselines of each item's first line of text are aligned. The baseline is the line the bottoms of letters sit on. Only works in a horizontal arrangement.

`'lastBaseline'`: the baselines of each item's last line of text are aligned. Only works in a horizontal arrangement. When every item has only one line of text, it gives the same result as `'firstBaseline'`:

```
┌──────────────────┐
│      ┌────┐      │
│┌────┐│ Bg │┌────┐│
││ Ag ││    ││ Cg ││   ← the baselines of the three texts are on one horizontal line
│└────┘└────┘└────┘│
└──────────────────┘
```

In a vertical arrangement, the cross axis is horizontal:

| Value | Effect in a vertical arrangement |
| --- | --- |
| `'fill'` | All items as wide as the stack view |
| `'leading'` (`'top'`) | Items aligned to the leading edge. In left-to-right languages, the left |
| `'center'` | Items centered horizontally |
| `'trailing'` (`'bottom'`) | Items aligned to the trailing edge. In left-to-right languages, the right |
| `'firstBaseline'`, `'lastBaseline'` | No effect. To compute spacing from baselines in a vertical arrangement, use `isBaselineRelativeArrangement` |

The effect of `'fill'` was checked in the acceptance tests. The effects of the other values are **not verified in the simulator**.

### Two aliases

`'top'` and `'leading'` are the same value, and so are `'bottom'` and `'trailing'`. Either name can be written; they always read back as `'leading'` and `'trailing'`.

```js
const row = new UIStackView();
row.alignment = 'top';
console.log(row.alignment);   // 'leading'

row.alignment = 'bottom';
console.log(row.alignment);   // 'trailing'
```

**Effect**: The console prints `leading`, then `trailing`.

This is because in iOS's definition `UIStackViewAlignmentTop` equals `UIStackViewAlignmentLeading`. One value can only map to one name when read, and the runtime chose `'leading'` and `'trailing'`. The name read back does not change with `axis`.

When checking the current alignment, compare against `'leading'` and `'trailing'`, not `'top'` and `'bottom'`.

### Invalid values

Writing a value not in the table does not throw. The console prints a warning `[Nacre] alignment has no value "baseline"; expected one of: fill / leading / firstBaseline / center / trailing / lastBaseline / top / bottom, ignored`, and `alignment` keeps its previous value.

## Examples

```js
const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
  const block = new UIView();
  block.backgroundColor = color;
  return block;
});
const row = new UIStackView([red, orange, teal]);
row.alignment = 'center';

NSLayoutConstraint.activateConstraints([
  red.heightAnchor.constraintEqualToConstant(20),
  orange.heightAnchor.constraintEqualToConstant(44),
  teal.heightAnchor.constraintEqualToConstant(32),
]);
```

**Effect**: The three color blocks are 20, 44, and 32 pt tall, and their center lines are on the same horizontal line. **Not verified in the simulator.**

## Corresponding iOS API

`UIStackView.alignment`. `UIStackViewAlignmentCenter` is written `'center'`; `UIStackViewAlignmentTop` is written `'top'` and reads back as `'leading'`.

## See also

- [`isBaselineRelativeArrangement`](isbaselinerelativearrangement.md): computing spacing from baselines in a vertical arrangement
- [`axis`](axis.md)
- [Enums](../enums.md): which name is read back when one value has two names
