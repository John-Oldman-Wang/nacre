---
type: reference
native: UIActivityIndicatorView.activityIndicatorViewStyle
---

# `UIActivityIndicatorView`: `activityIndicatorViewStyle` property

The **`activityIndicatorViewStyle`** property is the style of the activity indicator. The style determines the size the indicator wants.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'medium'` | The wanted size is 20 × 20 [pt](../units.md) |
| `'large'` | The wanted size is 37 × 37 pt |

- Readable and writable.
- The default is `'medium'`.
- Changing the style changes only the size the indicator wants (the inherited `intrinsicContentSize`). `frame` doesn't change with it, and neither does the color. An indicator positioned with Auto Layout takes the new size on the next layout pass; an indicator positioned with `frame` needs another call to `sizeToFit()`.
- There's no change event. Only the app's own code changes it.

### Invalid values

Writing a value not in the table doesn't throw. The console prints a warning, and the style keeps its previous value.

```
[Nacre] activityIndicatorViewStyle has no value "small"; expected one of: …, ignored
```

The values `'gray'`, `'white'`, and `'whiteLarge'`, deprecated in ObjC, are also treated as invalid.

## Examples

```js
const spinner = new UIActivityIndicatorView();
spinner.activityIndicatorViewStyle = 'large';
console.log(spinner.frame.width);
spinner.sizeToFit();
console.log(spinner.frame.width, spinner.frame.height);
```

**Result**: First prints `0`; changing the style didn't change `frame`. After `sizeToFit()` it prints `37 37`.

## Corresponding iOS API

`UIActivityIndicatorView.activityIndicatorViewStyle`. `UIActivityIndicatorViewStyleMedium` is written `'medium'`, and `UIActivityIndicatorViewStyleLarge` is written `'large'`.

## See also

- [Enums](../enums.md): why an invalid property value produces a warning instead of an exception
- [Size follows the style](../ui-activity-indicator-view.md#size-follows-the-style)
