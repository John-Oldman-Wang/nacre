---
type: reference
native: PHPickerResult
status: partial
---

# `PHPickerResult`

**`PHPickerResult`** represents one item the user picked in the photo picker. It appears only in the `results` of the [`pick`](photos/pick-event.md) event.

It isn't an image itself. Its [`itemProvider`](ph-picker-result/itemprovider.md) is the provider of this item's content, and the image is loaded from the provider.

You need to install `@nacrejs/photos` first; for how, see [`PHPickerViewController`](photos.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: `NSObject` → `PHPickerResult`

## Constructor

It can't be created with `new`. `new PHPickerResult()` throws `TypeError`:

```
Illegal constructor: PHPickerResult is created by the runtime, not by new
```

## Instance properties

| Property | Description |
| --- | --- |
| [`itemProvider`](ph-picker-result/itemprovider.md) <small>read-only</small> | The provider of this item's content |

## Examples

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', async (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  picker.dismissViewController({ animated: true });
  for (const result of results) {
    const image = await result.itemProvider.loadObjectOfClass(UIImage);
    console.log(image.size.width, image.size.height);
  }
});
```

**Effect**: After the user finishes picking, one line with the width and height (in [points](units.md)) is printed for each picked image. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `result.itemProvider` | `result.itemProvider` |

## See also

- [`NSItemProvider`](ns-item-provider.md): loading images from the provider
- [`pick`](photos/pick-event.md): where results come from
