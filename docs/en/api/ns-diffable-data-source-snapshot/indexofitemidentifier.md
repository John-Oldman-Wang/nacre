---
type: reference
native: "-[NSDiffableDataSourceSnapshot indexOfItemIdentifier:]"
---

# `NSDiffableDataSourceSnapshot`: `indexOfItemIdentifier()` method

The **`indexOfItemIdentifier()`** method returns an item's position among all items.

## Syntax

```
indexOfItemIdentifier(itemIdentifier)
```

### Parameters

**`itemIdentifier`**

The item's identifier.

### Return value

A number counted from 0: the position among all items. `-1` if there's no such item.

### Exceptions

None.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.indexOfItemIdentifier('kale'), snapshot.indexOfItemIdentifier('nope'));
```

**Result**: Prints `2 -1`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot indexOfItemIdentifier:]`. `NSNotFound` is replaced by -1.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
