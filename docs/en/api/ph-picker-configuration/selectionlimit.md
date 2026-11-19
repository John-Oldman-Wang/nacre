---
type: reference
native: PHPickerConfiguration.selectionLimit
---

# `PHPickerConfiguration`: `selectionLimit` property

The **`selectionLimit`** property is the maximum number of items that can be selected in the photo picker.

## Value

A number (a count).

- Readable and writable.
- Defaults to `1`: tapping one item completes the selection.
- `0` means no limit.
- When it's greater than 1, the remaining items can't be tapped once the limit is reached (**not verified in the simulator**).
- Only the app can change it; there's no change notification.

### Invalid values

- Fractions are truncated toward zero: writing `2.9` gives `2`. Strings that look like numbers are converted: writing `'3'` gives `3`.
- Writing a negative number throws `TypeError`, and the value stays unchanged: `selectionLimit must not be negative, got -1`.
- Values that can't be converted to a finite number throw `TypeError`, and the value stays unchanged: `selectionLimit must be a finite number, got "abc"`.

## Examples

```js
const config = new PHPickerConfiguration();
config.selectionLimit = 9;
config.selection = 'ordered';
```

**Effect**: a photo picker created with this configuration allows up to 9 images and shows on each one the order in which it was selected. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`PHPickerConfiguration.selectionLimit`.

## See also

- [`selection`](selection.md): how selection works
- [Picking photos and saving images to the photo library](../../guides/pick-photos.md#picking-several-at-once)
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
