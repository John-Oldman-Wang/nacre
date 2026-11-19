---
type: reference
native: UIView.contentMode
---

# `UIView`: `contentMode` property

The **`contentMode`** property determines how the view's content is placed when its size differs from the view's. It is mainly used on [`UIImageView`](../ui-image.md). "Content" means what the view draws, such as the image in a `UIImageView`.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'scaleToFill'` | Stretches the content to the same size as the view. Content is distorted when the aspect ratios differ |
| `'scaleAspectFit'` | Scales while keeping the aspect ratio until the content fits entirely inside the view. Empty space may be left on two sides |
| `'scaleAspectFill'` | Scales while keeping the aspect ratio until the content covers the view. The excess is drawn outside the view; to clip it, set `clipsToBounds = true` |
| `'center'` | No scaling; the content is centered at its original size |
| `'top'`, `'bottom'`, `'left'`, `'right'` | No scaling; the content is placed against the corresponding edge and centered along the other axis. **Not verified in the simulator** |
| `'topLeft'`, `'topRight'`, `'bottomLeft'`, `'bottomRight'` | No scaling; the content is placed in the corresponding corner. **Not verified in the simulator** |
| `'redraw'` | Redraws the content when the view's size changes, without scaling. **Not verified in the simulator** |

- Readable and writable.
- The default is `'scaleToFill'`.

### Invalid values

Writing a value not in the table doesn't throw. The console prints a warning `[Nacre] contentMode has no value "cover"; expected one of: …, ignored`, where the ellipsis is all the values in the table above, and the property keeps its previous value.

## Examples

```js
const photo = new UIImageView();
photo.contentMode = 'scaleAspectFill';
photo.clipsToBounds = true;
```

**Effect**: The image covers the view while keeping its aspect ratio, and the part outside the view is clipped.

## Corresponding iOS API

`UIView.contentMode`. `UIViewContentModeScaleAspectFit` is written as `'scaleAspectFit'`, and likewise for the others.

## See also

- [`UIImageView`](../ui-image.md)
- [Enums](../enums.md): why an invalid property value is a warning
