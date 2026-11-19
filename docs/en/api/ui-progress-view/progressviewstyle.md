---
type: reference
native: UIProgressView.progressViewStyle
---

# `UIProgressView`: `progressViewStyle` property

The **`progressViewStyle`** property is the progress bar's style. The style determines the progress bar's height.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'default'` | 4 [pt](../units.md) tall |
| `'bar'` | Thinner, less than 4 pt tall; used in toolbars. Measured at 2.67 pt on a 3x screen |

- Readable and writable.
- Defaults to `'default'`.
- When the style changes, the height of `frame` immediately becomes the new style's height. Switching from `'bar'` back to `'default'` returns the height to 4 pt.
- The color difference between the two styles on screen is **not verified in the simulator**.
- There is no change event. Only the app's own code changes it.

### Invalid values

Writing a value not in the table doesn't throw; a warning is printed to the console and the style keeps its previous value.

```
[Nacre] progressViewStyle has no value "thick"; expected one of: default / bar, ignored
```

## Examples

```js
const bar = new UIProgressView();
bar.progressViewStyle = 'bar';
console.log(bar.frame.height < 4);
```

**Result**: Prints `true`; the progress bar becomes thinner.

## Corresponding iOS API

`UIProgressView.progressViewStyle`. `UIProgressViewStyleDefault` is written as `'default'`, and `UIProgressViewStyleBar` as `'bar'`.

## See also

- [The height is determined by the style](../ui-progress-view.md#the-height-is-determined-by-the-style): use a height constraint for a thicker progress bar
- [Enums](../enums.md): why an invalid property write warns instead of throwing
