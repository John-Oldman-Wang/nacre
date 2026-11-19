---
type: reference
native: "-[NSDiffableDataSourceSnapshot appendSectionsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`: `appendSectionsWithIdentifiers()` method

The **`appendSectionsWithIdentifiers()`** method adds sections at the end.

## Syntax

```
appendSectionsWithIdentifiers(sectionIdentifiers)
```

### Parameters

**`sectionIdentifiers`**

An array of identifiers. Each identifier is a string or an integer.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- A section identifier is already in the snapshot (measured).
- An identifier isn't a string or an integer, or the argument isn't an array.

On error the snapshot is left unchanged; none of the identifiers in that call are added. For the common errors, see [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.appendSectionsWithIdentifiers(['meat']);
console.log(snapshot.sectionIdentifiers.join(','));
```

**Result**: Prints `fruit,veg,meat`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot appendSectionsWithIdentifiers…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
