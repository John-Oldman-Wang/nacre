---
type: reference
native: "-[NSDiffableDataSourceSnapshot insertItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`: `insertItemsWithIdentifiers()` method

The **`insertItemsWithIdentifiers()`** method inserts items before or after a given item, into the section that item is in.

## Syntax

```
insertItemsWithIdentifiers(itemIdentifiers, { beforeItemWithIdentifier })
insertItemsWithIdentifiers(itemIdentifiers, { afterItemWithIdentifier })
```

### Parameters

**`itemIdentifiers`**

An array of identifiers. Each identifier is a string or an integer.

**`options.beforeItemWithIdentifier`**, **`options.afterItemWithIdentifier`**

The identifier of the item to insert before or after. Exactly one of the two keys must be given.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The item referred to doesn't exist: `insertItemsWithIdentifiers: there is no item with identifier "nope"`
- Neither or both of `before…` and `after…` given: `insertItemsWithIdentifiers needs exactly one of { beforeItemWithIdentifier } or { afterItemWithIdentifier }`
- An identifier being added is already in the snapshot.

On error the snapshot is left unchanged; none of the identifiers in that call are added. For the common errors, see [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.insertItemsWithIdentifiers(['fig'], { beforeItemWithIdentifier: 'apple' });
console.log(snapshot.itemIdentifiers.join(','));
```

**Result**: Prints `fig,apple,pear,kale`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot insertItemsWithIdentifiers…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
