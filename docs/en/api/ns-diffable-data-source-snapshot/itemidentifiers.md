---
type: reference
native: NSDiffableDataSourceSnapshot.itemIdentifiers
---

# `NSDiffableDataSourceSnapshot`: `itemIdentifiers` property

The **`itemIdentifiers`** property is the identifiers of all items, concatenated in section order.

## Value

An array of identifiers. Each read returns a new array.

- Read-only; assigning to it throws `TypeError`.
- In a new snapshot, it's `0` or an empty array.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.itemIdentifiers.join(','));
```

**Result**: Prints `apple,pear,kale`.

## Corresponding iOS API

`NSDiffableDataSourceSnapshot.itemIdentifiers`.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
