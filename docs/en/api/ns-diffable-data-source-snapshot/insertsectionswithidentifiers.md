---
type: reference
native: "-[NSDiffableDataSourceSnapshot insertSectionsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`: `insertSectionsWithIdentifiers()` method

The **`insertSectionsWithIdentifiers()`** method inserts sections before or after a given section.

## Syntax

```
insertSectionsWithIdentifiers(sectionIdentifiers, { beforeSectionWithIdentifier })
insertSectionsWithIdentifiers(sectionIdentifiers, { afterSectionWithIdentifier })
```

### Parameters

**`sectionIdentifiers`**

An array of identifiers. Each identifier is a string or an integer.

**`options.beforeSectionWithIdentifier`**, **`options.afterSectionWithIdentifier`**

The identifier of the section to insert before or after. Exactly one of the two keys must be given.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The section referred to doesn't exist (measured).
- Neither or both of `before…` and `after…` given.
- A section identifier is already in the snapshot.

On error the snapshot is left unchanged; none of the identifiers in that call are added. For the common errors, see [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.insertSectionsWithIdentifiers(['grain'], { afterSectionWithIdentifier: 'fruit' });
console.log(snapshot.sectionIdentifiers.join(','));
```

**Result**: Prints `fruit,grain,veg`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot insertSectionsWithIdentifiers…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
