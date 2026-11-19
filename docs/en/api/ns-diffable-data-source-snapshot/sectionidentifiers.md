---
type: reference
native: NSDiffableDataSourceSnapshot.sectionIdentifiers
---

# `NSDiffableDataSourceSnapshot`: `sectionIdentifiers` property

The **`sectionIdentifiers`** property is the identifiers of all sections, in order.

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
console.log(snapshot.sectionIdentifiers.join(','));
```

**Result**: Prints `fruit,veg`.

## Corresponding iOS API

`NSDiffableDataSourceSnapshot.sectionIdentifiers`.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
