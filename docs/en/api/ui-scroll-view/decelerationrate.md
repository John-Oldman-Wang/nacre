---
type: reference
native: UIScrollView.decelerationRate
---

# `UIScrollView`: `decelerationRate` property

The **`decelerationRate`** property determines how far the content slides after release before stopping.

## Value

The string `'normal'` or `'fast'`; numbers are also accepted when writing.

| Value | Effect |
| --- | --- |
| `'normal'` | Slides far |
| `'fast'` | Stops quickly. Use for carousels and pickers |

- Readable and writable.
- Defaults to `'normal'`.
- Numbers are also accepted (`'normal'` corresponds to 0.998, `'fast'` to 0.99), but the system has only these two levels. Other numbers are mapped to the nearest level and still read back as `'normal'` or `'fast'`, without error. Measured: `0.5` and `0.95` read back as `'fast'`; `0.994`, `0.999`, and `1.5` read back as `'normal'`.
- No change event: only the app's own code changes it.

### Invalid values

Writing a string other than `'normal'` or `'fast'` (such as `'slow'`) does not throw; the property keeps its previous value, and the console logs a warning:

```
[Nacre] decelerationRate has no value "slow"; expected one of: a number / "normal" / "fast", ignored
```

## Examples

```js
const scroller = new UIScrollView();
scroller.decelerationRate = 0.95;
console.log(scroller.decelerationRate);
```

**Result**: logs `fast`.

## Corresponding iOS API

`UIScrollView.decelerationRate`. `UIScrollViewDecelerationRateFast` is written `'fast'`.

## See also

- [`isPagingEnabled`](ispagingenabled.md)
