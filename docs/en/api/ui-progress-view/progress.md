---
type: reference
native: UIProgressView.progress
---

# `UIProgressView`: `progress` property

The **`progress`** property is the fraction complete: how much of the whole bar the filled portion takes up.

## Value

A number from 0 to 1, unitless. 0 means not started; 1 means fully complete.

- Readable and writable.
- Defaults to 0.
- Values below 0 are treated as 0 and values above 1 as 1; nothing is thrown.
- Stored as a 32-bit float: writing `0.3` reads back `0.30000001192092896` (equal to `Math.fround(0.3)`). Values that a 32-bit float represents exactly, such as 0.5 and 0.25, read back unchanged. To compare, compare with the result of `Math.fround()`; to display a percentage, use `Math.round(bar.progress * 100)`.
- Writing this property isn't animated. For animation, use [`setProgress()`](setprogress.md).
- There is no change event. Only the app's own code changes it.

### Invalid values

Writes are converted with `Number()`: `'0.25'` gives 0.25, and `null` gives 0.

A value that can't be converted to a finite number (`undefined`, `NaN`, `Infinity`, `'half'`) throws `TypeError`, and the previous value is unchanged:

```
TypeError: progress must be a finite number, got undefined
```

## Examples

```js
const bar = new UIProgressView();
bar.progress = 0.5;
console.log(bar.progress);
bar.progress = 0.3;
console.log(bar.progress === Math.fround(0.3));
bar.progress = 2;
console.log(bar.progress);
```

**Result**: Prints `0.5`, `true`, `1` in order. When 0.5 is written, the filled portion immediately becomes half of the bar, with no animation.

## Corresponding iOS API

`UIProgressView.progress`. A `float` in ObjC.

## See also

- [`setProgress()`](setprogress.md): changing the progress with animation
- [Showing loading and progress](../../guides/loading-and-progress.md#converting-the-number-completed-into-progress): keep the count of completed items yourself, compute the fraction, and write it to the progress bar
