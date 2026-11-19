---
type: reference
native: NSItemProvider.suggestedName
---

# `NSItemProvider`: `suggestedName` property

The **`suggestedName`** property is the file name the system suggests, without an extension.

## Value

A string, or `null`.

- Read-only. Assigning to it throws `TypeError`.
- `null` when there's no suggested name.
- Its contents don't change after the provider is created, so there's no change notification.

## Examples

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  for (const result of results) {
    console.log(result.itemProvider.suggestedName ?? '(no name)');
  }
});
```

**Effect**: after the user finishes picking, prints one line per item with its file name. What name a selected photo gives is **not verified in the simulator**.

## Corresponding iOS API

`NSItemProvider.suggestedName`.

## See also

- [`registeredTypeIdentifiers`](registeredtypeidentifiers.md): which formats the item has
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
