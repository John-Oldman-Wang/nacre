---
type: reference
native: NSItemProvider.registeredTypeIdentifiers
---

# `NSItemProvider`: `registeredTypeIdentifiers` property

The **`registeredTypeIdentifiers`** property lists which formats this item has.

## Value

An array of strings. Each value is a [uniform type identifier](../ns-item-provider.md#uniform-type-identifiers): `'public.jpeg'`, `'public.heic'`, `'public.png'`, `'com.apple.quicktime-movie'`.

- Read-only. Assigning to it throws `TypeError`.
- Its contents don't change after the provider is created, so there's no change notification.
- Exactly which identifiers a selected photo gives is **not verified in the simulator**.

## Examples

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (event) => {
  const { results } = event;
  for (const result of results) {
    console.log(result.itemProvider.registeredTypeIdentifiers.join(', '));
  }
});
```

**Effect**: after the user finishes picking, prints one line per item with its formats, such as `public.heic, public.jpeg`. **Not verified in the simulator.**

## Corresponding iOS API

`NSItemProvider.registeredTypeIdentifiers`.

## See also

- [`hasItemConformingToTypeIdentifier()`](hasitemconformingtotypeidentifier.md): checking against a parent type
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
