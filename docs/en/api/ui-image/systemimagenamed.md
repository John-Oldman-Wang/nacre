---
type: reference
native: "+[UIImage systemImageNamed:]"
---

# `UIImage.systemImageNamed()` static method

The **`UIImage.systemImageNamed()`** static method gets an icon from SF Symbols by name. SF Symbols is the icon library built into iOS, with thousands of icons; you don't need to prepare image files yourself, and it doesn't add to the app's size.

## Syntax

```
UIImage.systemImageNamed(name)
```

### Parameters

**`name`**

A string. The SF Symbols icon name, such as `'star.fill'` or `'heart.fill'`. You can look up all icon names in Apple's SF Symbols app. Non-strings are converted with `String()`.

### Return value

A `UIImage` whose [`isSymbolImage`](issymbolimage.md) is `true`. Returns `null` when the name doesn't exist, rather than throwing.

In an image view, the icon is colored with the image view's `tintColor`; see [Rendering mode and `tintColor`](../ui-image.md#rendering-mode-and-tintcolor).

### Exceptions

None.

## Examples

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  console.log(star.isSymbolImage, star.renderingMode);
}
```

**Result**: The console prints `true automatic`.

## Corresponding iOS API

`+[UIImage systemImageNamed:]`.

## See also

- [`tintColor`](../ui-image-view/tintcolor.md) on [`UIImageView`](../ui-image-view.md): coloring icons
