---
type: reference
native: UIStackView.distribution
---

# `UIStackView`: `distribution` property

The **`distribution`** property determines how space on the main axis (the direction of arrangement) is divided among the arranged subviews.

## Value

A string, one of these five:

| Value | Effect |
| --- | --- |
| `'fill'` | Items are laid out at their intrinsic size. Extra space goes to the item with the lowest content hugging priority; when space is short, the item with the lowest compression resistance priority is squeezed first |
| `'fillEqually'` | All items are the same size on the main axis. Each item's size is (stack view size − spacing × (number of items − 1)) ÷ number of items |
| `'fillProportionally'` | Extra or missing space is divided in proportion to the items' intrinsic sizes |
| `'equalSpacing'` | Items keep their intrinsic size; extra space is divided evenly between items |
| `'equalCentering'` | Items keep their intrinsic size; the distances between the centers of adjacent items are equal |

- Readable and writable.
- The default is `'fill'`.
- No change notification. Only the app's own code can change it.

### What each value looks like

All of the diagrams below are horizontal arrangements in which the three items' intrinsic widths are `A` narrow, `B` medium, and `C` wide, and the stack view is wider than the three together.

`'fill'` (the default): items are laid out at their intrinsic size, and extra space goes to the item with the lowest content hugging priority. In the diagram, `C` is stretched.

```
┌──────────────────────────────────┐
│[A] [ B  ] [          C          ]│
└──────────────────────────────────┘
```

`'fillEqually'`: all items are the same size, regardless of intrinsic size.

```
┌──────────────────────────────────┐
│[    A    ] [    B    ] [    C   ]│
└──────────────────────────────────┘
```

`'fillProportionally'`: extra space is divided in proportion to intrinsic size; the item that was wider gets more.

```
┌──────────────────────────────────┐
│[  A  ] [    B    ] [      C     ]│
└──────────────────────────────────┘
```

`'equalSpacing'`: items keep their intrinsic size, and extra space is divided evenly into the gaps between items. The first item touches the stack view's leading edge and the last touches the trailing edge.

```
┌──────────────────────────────────┐
│[A]          [ B  ]        [  C  ]│
└──────────────────────────────────┘
```

`'equalCentering'`: items keep their intrinsic size, and the distances between the centers of adjacent items are equal.

```
┌──────────────────────────────────┐
│[A]           [ B  ]       [  C  ]│
└──────────────────────────────────┘
  ↑              ↑             ↑
  equal distances between the three centers
```

`spacing` means different things for the two groups of values:

| `distribution` | What `spacing` means |
| --- | --- |
| `'fill'`, `'fillEqually'`, `'fillProportionally'` | The spacing between adjacent items is exactly this value |
| `'equalSpacing'`, `'equalCentering'` | The spacing between adjacent items is at least this value |

When the stack view is narrower than the items together, the items are squeezed. Which is squeezed first is decided by another priority; see [`setContentCompressionResistancePriority()`](../ui-view/setcontentcompressionresistancepriority.md). The squeezing effect is **not verified in the simulator**.

Of the five values, the effect of `'fillEqually'` was checked in the acceptance tests. The effects of the other four are **not verified in the simulator**.

> **Note:** `distribution` has only these five values; there is no value for "items packed at one end" or "centered as a group". To center a group of views or pack them at one end, do not let the stack view fill the space; use constraints to place the stack view itself in the center or at that end, and let its content decide its width.

### Invalid values

Writing a value not in the table (such as `'spaceBetween'`) does not throw. The console prints a warning `[Nacre] distribution has no value "spaceBetween"; expected one of: …, ignored`, where the ellipsis is all the available values, and `distribution` keeps its previous value.

## Examples

```js
const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
  const block = new UIView();
  block.backgroundColor = color;
  return block;
});
const row = new UIStackView([red, orange, teal]);
row.distribution = 'fillEqually';
row.spacing = 12;
```

**Effect**: The three color blocks have the same width, with 12 pt between each pair. Each block's width is (row width − 2 × 12) ÷ 3.

## Corresponding iOS API

`UIStackView.distribution`. `UIStackViewDistributionFillEqually` is written `'fillEqually'`, and likewise for the rest.

## See also

- [`spacing`](spacing.md)
- [`setContentHuggingPriority()`](../ui-view/setcontenthuggingpriority.md): with `'fill'`, decides who gets the extra space
- [Making one item fill the remaining space](../../guides/stack-views.md#letting-one-item-fill-the-remaining-space)
