---
type: reference
native: UIStackView.baselineRelativeArrangement
---

# `UIStackView`: `isBaselineRelativeArrangement` property

The **`isBaselineRelativeArrangement`** property determines where spacing is measured from in a vertical arrangement.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | In a vertical arrangement, spacing is measured from the baseline of the last line of text in one item to the baseline of the first line of text in the next. The baseline is the line the bottoms of letters sit on |
| `false` | Spacing is measured from the bottom edge of one item to the top edge of the next |

- Readable and writable.
- The default is `false`. The default and reading/writing were checked in the acceptance tests; the effect of setting it to `true` is **not verified in the simulator**.
- This property has no effect in a horizontal arrangement. To align by baseline in a horizontal arrangement, use `'firstBaseline'` or `'lastBaseline'` for [`alignment`](alignment.md).
- Converted with `Boolean()` on write.
- No change notification. Only the app's own code can change it.

## Examples

```js
const column = new UIStackView();
column.axis = 'vertical';
column.spacing = 20;
column.isBaselineRelativeArrangement = true;
```

**Effect**: The baselines of adjacent lines of text are 20 pt apart. **Not verified in the simulator.**

## Corresponding iOS API

`UIStackView.baselineRelativeArrangement`. Its ObjC getter name is `isBaselineRelativeArrangement`, and JS uses that name for both reading and writing.

## See also

- [`alignment`](alignment.md): baseline alignment in a horizontal arrangement
