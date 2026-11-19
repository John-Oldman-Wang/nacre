---
type: reference
native: "-[NSDiffableDataSourceSnapshot deleteSectionsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`: `deleteSectionsWithIdentifiers()` method

The **`deleteSectionsWithIdentifiers()`** method deletes sections, along with the items in them.

## Syntax

```
deleteSectionsWithIdentifiers(sectionIdentifiers)
```

### Parameters

**`sectionIdentifiers`**

An array of identifiers. Each identifier is a string or an integer. Identifiers that don't exist are ignored.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

An identifier isn't a string or an integer, or the argument isn't an array.

On error the snapshot is left unchanged; none of the identifiers in that call are added. For the common errors, see [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.deleteSectionsWithIdentifiers(['veg', 'nope']);
console.log(snapshot.numberOfSections, snapshot.numberOfItems);
```

**Result**: Prints `1 2`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot deleteSectionsWithIdentifiers…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
