---
type: reference
native: UIScrollView.contentInsetAdjustmentBehavior
---

# `UIScrollView`: `contentInsetAdjustmentBehavior` property

The **`contentInsetAdjustmentBehavior`** property determines whether the system automatically adds space around the content for the safe area.

## Value

A string, one of these four:

| Value | Effect |
| --- | --- |
| `'automatic'` | The system decides; usually the same as `'scrollableAxes'` |
| `'scrollableAxes'` | Adds space only in directions that can scroll |
| `'never'` | Adds no space. Content starts at the screen edge and is covered by the notch and the home indicator |
| `'always'` | Adds space on all four sides |

- Readable and writable.
- Defaults to `'automatic'`.
- No change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw; the property keeps its previous value, and the console logs a warning listing all valid values:

```
[Nacre] contentInsetAdjustmentBehavior has no value "x"; expected one of: automatic / scrollableAxes / never / always, ignored
```

## Examples

```js
const scroller = new UIScrollView();
scroller.contentInsetAdjustmentBehavior = 'never';
```

**Effect**: the first row of content starts at the very top of the screen and is covered by the notch. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.contentInsetAdjustmentBehavior`. `UIScrollViewContentInsetAdjustmentNever` is written `'never'`, and likewise for the others.

## See also

- [Safe area](../ui-scroll-view.md#safe-area)
- [`adjustedContentInset`](adjustedcontentinset.md)
