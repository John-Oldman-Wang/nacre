---
type: reference
native: "-[UICollectionViewListCell defaultContentConfiguration]"
---

# `UICollectionViewListCell`: `defaultContentConfiguration()` method

The **`defaultContentConfiguration()`** method returns a content configuration matching the list's appearance, with no content on it yet.

## Syntax

```
defaultContentConfiguration()
```

### Parameters

None.

### Return value

A new [`UIListContentConfiguration`](../ui-list-content-configuration.md). After setting its text and image, write it to the cell's [`contentConfiguration`](../ui-collection-view-cell/contentconfiguration.md).

### Exceptions

None.

## Examples

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  const content = cell.defaultContentConfiguration();
  content.text = 'Coffee beans 500 g';
  content.secondaryText = 'Shipped';
  cell.contentConfiguration = content;
}
```

**Effect**: calling `inspect(cell)` on a cell makes the row show "Coffee beans 500 g" on top and "Shipped" in gray below.

## Corresponding iOS API

`-[UICollectionViewListCell defaultContentConfiguration]`.

## See also

- [`UIListContentConfiguration`](../ui-list-content-configuration.md)
