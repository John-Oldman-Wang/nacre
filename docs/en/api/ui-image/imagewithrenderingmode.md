---
type: reference
native: "-[UIImage imageWithRenderingMode:]"
---

# `UIImage`: `imageWithRenderingMode()` method

The **`imageWithRenderingMode()`** method makes an image with a different rendering mode. Turn your own image into a template image, and image views can color it with `tintColor`.

## Syntax

```
imageWithRenderingMode(mode)
```

### Parameters

**`mode`**

`'automatic'`, `'alwaysOriginal'`, or `'alwaysTemplate'`. For their meanings, see [`renderingMode`](renderingmode.md).

### Return value

A new `UIImage`. The original is unchanged: `star.imageWithRenderingMode('alwaysOriginal') === star` is `false`. Called on an animated image, it gives a static image of the first frame.

### Exceptions

**`TypeError`**

`mode` is misspelled: `renderingMode has no value "template"; expected one of: …`.

## Examples

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  const template = star.imageWithRenderingMode('alwaysTemplate');
  console.log(template.renderingMode);
}
```

**Result**: The console prints `alwaysTemplate`.

## Corresponding iOS API

`-[UIImage imageWithRenderingMode:]`. `UIImageRenderingModeAlwaysTemplate` is written `'alwaysTemplate'`, and the rest likewise.

## See also

- [Rendering mode and `tintColor`](../ui-image.md#rendering-mode-and-tintcolor)
- [`tintColor`](../ui-image-view/tintcolor.md) on [`UIImageView`](../ui-image-view.md)
