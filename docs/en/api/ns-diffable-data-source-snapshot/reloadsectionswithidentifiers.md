---
type: reference
native: "-[NSDiffableDataSourceSnapshot reloadSectionsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`: `reloadSectionsWithIdentifiers()` method

The **`reloadSectionsWithIdentifiers()`** method marks the content of the items in some sections as changed. When the snapshot is applied, the cells in those sections are fetched again.

## Syntax

```
reloadSectionsWithIdentifiers(sectionIdentifiers)
```

### Parameters

**`sectionIdentifiers`**

An array of identifiers. Each identifier is a string or an integer.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The section referred to doesn't exist (measured).

On error the snapshot is left unchanged; none of the identifiers in that call are added. For the common errors, see [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.reloadSectionsWithIdentifiers(['fruit']);
```

**Effect**: The next time this snapshot is passed to `applySnapshot()`, the rows in the "fruit" section fetch their cells again.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot reloadSectionsWithIdentifiers…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
