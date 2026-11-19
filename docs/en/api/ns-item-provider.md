---
type: reference
native: NSItemProvider
status: partial
---

# `NSItemProvider`

**`NSItemProvider`** represents a provider for one item of content. The same item may come in several formats (HEIC and JPEG of the same photo), and the provider retrieves it in the type you ask for.

Each item selected in the photo picker comes with a provider, on the [`itemProvider`](ph-picker-result/itemprovider.md) of [`PHPickerResult`](ph-picker-result.md). Currently only the members needed to get images are bound, and only `UIImage` is recognized.

You need to install `@nacrejs/photos` first; for how, see [`PHPickerViewController`](photos.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: `NSObject` → `NSItemProvider`

## Constructor

[`NSItemProvider()`](ns-item-provider/constructor.md)

Creates a provider from a `UIImage`. Picking photos doesn't need it: each selected item comes with its own provider.

## Instance properties

| Property | Description |
| --- | --- |
| [`registeredTypeIdentifiers`](ns-item-provider/registeredtypeidentifiers.md) <small>read-only</small> | Which formats the item has |
| [`suggestedName`](ns-item-provider/suggestedname.md) <small>read-only</small> | The file name the system suggests |

## Instance methods

| Method | Description |
| --- | --- |
| [`hasItemConformingToTypeIdentifier()`](ns-item-provider/hasitemconformingtotypeidentifier.md) | Whether the item is a certain kind of content |
| [`canLoadObjectOfClass()`](ns-item-provider/canloadobjectofclass.md) | Whether an object of a certain class can be retrieved |
| [`loadObjectOfClass()`](ns-item-provider/loadobjectofclass.md) | Retrieves an object of that class; returns a Promise |

## Uniform type identifiers

**Uniform type identifiers** are strings the system uses to represent data types, such as `'public.jpeg'`, `'public.heic'`, `'public.png'`, and `'com.apple.quicktime-movie'`. They form a hierarchy: `'public.image'` covers all image formats, and `'public.movie'` covers all video formats. `registeredTypeIdentifiers` gives specific formats, while `hasItemConformingToTypeIdentifier()` can check against a parent name.

## Examples

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', async (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  for (const result of results) {
    const provider = result.itemProvider;
    if (provider.canLoadObjectOfClass(UIImage)) {
      const image = await provider.loadObjectOfClass(UIImage);
      console.log('Image ' + provider.suggestedName, image.size.width);
    } else if (provider.hasItemConformingToTypeIdentifier('public.movie')) {
      console.log('Video ' + provider.suggestedName + ', which cannot be retrieved yet');
    }
  }
});
```

**Effect** (**not verified in the simulator**): prints one line per selected item; images include the width, videos only the name.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[NSItemProvider alloc] initWithObject:image]` | `new NSItemProvider(image)` |
| `[provider canLoadObjectOfClass:UIImage.class]` | `provider.canLoadObjectOfClass(UIImage)` |
| `[provider loadObjectOfClass:UIImage.class completionHandler:^(id image, NSError *error) { … }]` | `await provider.loadObjectOfClass(UIImage)` |

## See also

- [`PHPickerResult`](ph-picker-result.md): each selected item comes with a provider
- [`UIImage`](ui-image.md): the type of the retrieved object
- [Picking photos and saving images to the photo library](../guides/pick-photos.md#checking-whether-a-picked-item-is-an-image)
