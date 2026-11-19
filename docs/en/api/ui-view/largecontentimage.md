---
type: reference
native: UIView.largeContentImage
---

# `UIView`: `largeContentImage` property

The **`largeContentImage`** property is the image shown in the large content viewer. See [`showsLargeContentViewer`](showslargecontentviewer.md).

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- The default is **not verified in the simulator**.
- Writing back the original value doesn't throw (checked in the acceptance tests). The effect is **not verified in the simulator**.

## Examples

```js
const item = new UIView();
const star = UIImage.systemImageNamed('star');
item.largeContentImage = star;
```

**Effect**: The large content viewer uses the star icon. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.largeContentImage`.

## See also

- [`scalesLargeContentImage`](scaleslargecontentimage.md), [`largeContentImageInsets`](largecontentimageinsets.md)
