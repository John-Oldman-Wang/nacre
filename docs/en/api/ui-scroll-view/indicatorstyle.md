---
type: reference
native: UIScrollView.indicatorStyle
---

# `UIScrollView`: `indicatorStyle` property

The **`indicatorStyle`** property is the color of the scroll indicators.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'default'` | Chosen automatically for light or dark mode |
| `'black'` | A dark indicator, for light content |
| `'white'` | A light indicator, for dark content |

- Readable and writable.
- Defaults to `'default'`.
- No change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw; the property keeps its previous value, and the console logs a warning listing all valid values:

```
[Nacre] indicatorStyle has no value "x"; expected one of: default / black / white, ignored
```

## Examples

```js
const scroller = new UIScrollView();
scroller.indicatorStyle = 'white';
```

**Effect**: the indicator is light-colored and easy to see on dark content.

## Corresponding iOS API

`UIScrollView.indicatorStyle`. `UIScrollViewIndicatorStyleBlack` is written `'black'`, and likewise for the others.

## See also

- [`showsVerticalScrollIndicator`](showsverticalscrollindicator.md)
