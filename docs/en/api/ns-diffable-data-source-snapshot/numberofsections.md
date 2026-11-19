---
type: reference
native: NSDiffableDataSourceSnapshot.numberOfSections
---

# `NSDiffableDataSourceSnapshot`: `numberOfSections` property

The **`numberOfSections`** property is the total number of sections in the snapshot.

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
console.log(snapshot.numberOfSections);
```

**Result**: Prints `2`.

## Corresponding iOS API

`NSDiffableDataSourceSnapshot.numberOfSections`.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
