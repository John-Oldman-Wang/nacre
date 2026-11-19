---
type: reference
native: "-[NSItemProvider initWithObject:]"
---

# `NSItemProvider()` constructor

The **`NSItemProvider()`** constructor creates a content provider from an object. Currently it only accepts `UIImage`.

Picking photos doesn't need it: each item selected in the photo picker comes with its own provider.

## Syntax

```
new NSItemProvider(object)
```

### Parameters

**`object`**

A [`UIImage`](../ui-image.md), required.

### Return value

A new `NSItemProvider`. [`canLoadObjectOfClass(UIImage)`](canloadobjectofclass.md) is `true`, and [`hasItemConformingToTypeIdentifier('public.image')`](hasitemconformingtotypeidentifier.md) is `true`.

### Exceptions

**`TypeError`**

`object` isn't a `UIImage`:

```
new NSItemProvider supports only a UIImage for now, got "hello"
```

## Examples

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const provider = new NSItemProvider(photo);
  const copy = await provider.loadObjectOfClass(UIImage);
  console.log(copy.size.width > 0);
}
```

**Result**: prints `true`. The image retrieved from the provider has a size.

## Corresponding iOS API

`-[NSItemProvider initWithObject:]`.

## See also

- [`loadObjectOfClass()`](loadobjectofclass.md)
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
