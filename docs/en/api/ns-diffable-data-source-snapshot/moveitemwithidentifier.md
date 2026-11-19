---
type: reference
native: "-[NSDiffableDataSourceSnapshot moveItemWithIdentifier]"
---

# `NSDiffableDataSourceSnapshot`: `moveItemWithIdentifier()` method

The **`moveItemWithIdentifier()`** method moves an item before or after another item, possibly into a different section.

## Syntax

```
moveItemWithIdentifier(itemIdentifier, { beforeItemWithIdentifier })
moveItemWithIdentifier(itemIdentifier, { afterItemWithIdentifier })
```

### Parameters

**`itemIdentifier`**

The identifier of the item to move.

**`options.beforeItemWithIdentifier`**, **`options.afterItemWithIdentifier`**

The identifier of the item to place it before or after. Exactly one of the two keys must be given.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The item to move or the item referred to doesn't exist (measured).
- Moving an item next to itself: `moveItemWithIdentifier: an item cannot be moved next to itself`
- Neither or both of `before…` and `after…` given.

On error the snapshot is left unchanged; none of the identifiers in that call are added. For the common errors, see [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.moveItemWithIdentifier('kale', { afterItemWithIdentifier: 'apple' });
console.log(snapshot.itemIdentifiersInSectionWithIdentifier('fruit').join(','));
```

**Result**: Prints `apple,kale,pear`: "kale" has moved into the "fruit" section.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot moveItemWithIdentifier…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
