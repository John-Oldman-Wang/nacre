---
type: reference
native: UICollectionViewCell.contentConfiguration
---

# `UICollectionViewCell`: `contentConfiguration` property

The **`contentConfiguration`** property is the cell's content: primary text, secondary text, and image.

## Value

A [`UIListContentConfiguration`](../ui-list-content-configuration.md), or `null`.

- Readable and writable.
- The default value is `null`.
- **What is written is a copy.** Changing that object afterward doesn't affect the cell; to change what's displayed, assign again.
- **What is read is also a copy** (measured); changing it doesn't affect the cell.
- Writing `null` clears it; `contentView` then contains only the subviews you added.
- Cells are reused, so write it again every time in `cellProvider`.

## Examples

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  const content = cell.defaultContentConfiguration();
  content.text = 'First';
  cell.contentConfiguration = content;
  content.text = 'Second';
  const back = cell.contentConfiguration;
  console.log(back === null ? null : back.text);
}
```

**Result**: calling `inspect(cell)` on a cell logs `First`, and the cell also shows "First".

## Corresponding iOS API

`UICollectionViewCell.contentConfiguration`.

## See also

- [`UIListContentConfiguration`](../ui-list-content-configuration.md)
- [`defaultContentConfiguration()`](../ui-collection-view-list-cell/defaultcontentconfiguration.md)
