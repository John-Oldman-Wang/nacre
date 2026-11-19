---
type: reference
native: "-[NSItemProvider hasItemConformingToTypeIdentifier:]"
---

# `NSItemProvider`: `hasItemConformingToTypeIdentifier()` method

The **`hasItemConformingToTypeIdentifier()`** method checks whether this item is a certain kind of content.

## Syntax

```
hasItemConformingToTypeIdentifier(typeIdentifier)
```

### Parameters

**`typeIdentifier`**

A [uniform type identifier](../ns-item-provider.md#uniform-type-identifiers), a string. `'public.image'` is all images, and `'public.movie'` is all videos. Non-string values are converted to strings.

### Return value

A boolean. `true`: the item has a format that conforms to this kind.

### Exceptions

None.

## Examples

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const provider = new NSItemProvider(photo);
  console.log(provider.hasItemConformingToTypeIdentifier('public.image'));
  console.log(provider.hasItemConformingToTypeIdentifier('public.movie'));
}
```

**Result**: prints `true`, then `false`.

## Corresponding iOS API

`-[NSItemProvider hasItemConformingToTypeIdentifier:]`.

## See also

- [`canLoadObjectOfClass()`](canloadobjectofclass.md): whether an image can be retrieved
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
