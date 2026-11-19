---
type: reference
native: UIScrollView.automaticallyAdjustsScrollIndicatorInsets
---

# `UIScrollView`: `automaticallyAdjustsScrollIndicatorInsets` property

The **`automaticallyAdjustsScrollIndicatorInsets`** property indicates whether the system automatically adjusts the indicators' distance from the edges for the safe area.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The system automatically adjusts the effect of `verticalScrollIndicatorInsets` and `horizontalScrollIndicatorInsets` for the safe area |
| `false` | Only the distances written by the app are used |

- Readable and writable.
- Defaults to `true`.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.automaticallyAdjustsScrollIndicatorInsets = false;
```

**Effect**: the indicators no longer avoid the notch and the home indicator. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.automaticallyAdjustsScrollIndicatorInsets`.

## See also

- [`verticalScrollIndicatorInsets`](verticalscrollindicatorinsets.md)
