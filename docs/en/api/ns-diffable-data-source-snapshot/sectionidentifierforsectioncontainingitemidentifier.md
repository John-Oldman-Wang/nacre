---
type: reference
native: "-[NSDiffableDataSourceSnapshot sectionIdentifierForSectionContainingItemIdentifier:]"
---

# `NSDiffableDataSourceSnapshot`: `sectionIdentifierForSectionContainingItemIdentifier()` method

The **`sectionIdentifierForSectionContainingItemIdentifier()`** method returns which section an item is in.

## Syntax

```
sectionIdentifierForSectionContainingItemIdentifier(itemIdentifier)
```

### Parameters

**`itemIdentifier`**

The item's identifier.

### Return value

The section's identifier, or `null`. `null` if there's no such item.

### Exceptions

None.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.sectionIdentifierForSectionContainingItemIdentifier('kale'));
```

**Result**: Prints `veg`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot sectionIdentifierForSectionContainingItemIdentifier:]`.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
