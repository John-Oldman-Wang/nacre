---
type: reference
native: PHPickerResult.itemProvider
---

# `PHPickerResult`: `itemProvider` property

The **`itemProvider`** property is the provider of this item's content. Images are loaded from it.

## Value

[`NSItemProvider`](../ns-item-provider.md).

- Read-only. Assigning to it throws `TypeError`.

## Examples

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', async (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  if (results.length === 0) return;
  const provider = results[0].itemProvider;
  if (provider.canLoadObjectOfClass(UIImage)) {
    const image = await provider.loadObjectOfClass(UIImage);
    console.log(image.size.width);
  }
});
```

**Effect**: After the user picks an image, the console prints its width (in [points](../units.md)). **Not verified in the simulator.**

## Corresponding iOS API

`PHPickerResult.itemProvider`.

## See also

- [`loadObjectOfClass()`](../ns-item-provider/loadobjectofclass.md): loading the image
- This class belongs to the `@nacrejs/photos` package; for how to install it, see [Install first](../photos.md#installation)
