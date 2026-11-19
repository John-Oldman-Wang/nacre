---
type: reference
native: "-[NSDiffableDataSourceSnapshot deleteAllItems]"
---

# `NSDiffableDataSourceSnapshot`: `deleteAllItems()` method

The **`deleteAllItems()`** method deletes all sections and items.

## Syntax

```
deleteAllItems()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.deleteAllItems();
console.log(snapshot.numberOfSections, snapshot.numberOfItems);
```

**Result**: Prints `0 0`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot deleteAllItems…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
