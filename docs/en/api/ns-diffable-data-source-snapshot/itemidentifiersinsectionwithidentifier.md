---
type: reference
native: "-[NSDiffableDataSourceSnapshot itemIdentifiersInSectionWithIdentifier:]"
---

# `NSDiffableDataSourceSnapshot`: `itemIdentifiersInSectionWithIdentifier()` method

The **`itemIdentifiersInSectionWithIdentifier()`** method returns the identifiers of the items in a section.

## Syntax

```
itemIdentifiersInSectionWithIdentifier(sectionIdentifier)
```

### Parameters

**`sectionIdentifier`**

The section's identifier.

### Return value

An array of identifiers, in order.

### Exceptions

**`TypeError`**

There's no such section (measured).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.itemIdentifiersInSectionWithIdentifier('fruit').join(','));
```

**Result**: Prints `apple,pear`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot itemIdentifiersInSectionWithIdentifier:]`.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
