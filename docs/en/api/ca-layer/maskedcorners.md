---
type: reference
native: CALayer.maskedCorners
---

# `CALayer`: `maskedCorners` property

The **`maskedCorners`** property lists which corners are rounded.

## Value

An array of corner names:

| Corner name | Which corner |
| --- | --- |
| `'minXMinY'` | Top left |
| `'maxXMinY'` | Top right |
| `'minXMaxY'` | Bottom left |
| `'maxXMaxY'` | Bottom right |

In the names, `minX` is the left side, `maxX` the right side, `minY` the top, and `maxY` the bottom, because the y axis points down.

- Readable and writable.
- Defaults to all four corners.
- An empty array means all four corners are square.
- The array you read is in the order of the table above.

### Invalid values

- A misspelled corner name in the array doesn't throw: the whole assignment has no effect, the property keeps its previous value, and the console prints a warning. The correctly spelled names in the array aren't applied on their own:

  ```
  [Nacre] maskedCorners has no value "topLeft"; expected one of: minXMinY / maxXMinY / minXMaxY / maxXMaxY, ignored
  ```

- A value that isn't an array throws `TypeError`: `maskedCorners needs an array of names; expected any of: …`.

## Examples

```js
const layer = new CALayer();
layer.cornerRadius = 16;
layer.maskedCorners = ['maxXMinY', 'minXMinY'];
console.log(layer.maskedCorners.join(','));
```

**Effect**: The top-left and top-right corners are rounded; the bottom two are square. The console prints `minXMinY,maxXMinY`.

## Corresponding iOS API

`CALayer.maskedCorners`. The bitmask `kCALayerMinXMinYCorner | kCALayerMaxXMinYCorner` is written `['minXMinY', 'maxXMinY']`.

## See also

- [`cornerRadius`](cornerradius.md)
- [Enums](../enums.md)
