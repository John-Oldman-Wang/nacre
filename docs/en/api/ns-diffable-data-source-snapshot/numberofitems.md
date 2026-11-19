---
type: reference
native: NSDiffableDataSourceSnapshot.numberOfItems
---

# `NSDiffableDataSourceSnapshot`: `numberOfItems` property

The **`numberOfItems`** property is the total number of items in the snapshot, across all sections.

## Value

A number: a count.

- Read-only; assigning to it throws `TypeError`.
- In a new snapshot, it's `0` or an empty array.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.numberOfItems);
```

**Result**: Prints `3`.

## Corresponding iOS API

`NSDiffableDataSourceSnapshot.numberOfItems`.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
