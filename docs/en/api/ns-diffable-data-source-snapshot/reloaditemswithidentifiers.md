---
type: reference
native: "-[NSDiffableDataSourceSnapshot reloadItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`: `reloadItemsWithIdentifiers()` method

The **`reloadItemsWithIdentifiers()`** method marks the content of some items as changed. When the snapshot is applied, those items get a new cell, and `cellProvider` is called.

## Syntax

```
reloadItemsWithIdentifiers(itemIdentifiers)
```

### Parameters

**`itemIdentifiers`**

An array of identifiers. Each identifier is a string or an integer.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The item referred to doesn't exist (measured).

On error the snapshot is left unchanged; none of the identifiers in that call are added. For the common errors, see [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods).

## Description

When only the content has changed and you want to keep the existing cell, use [`reconfigureItemsWithIdentifiers()`](reconfigureitemswithidentifiers.md). See [Content changed: `reload` and `reconfigure`](../ns-diffable-data-source-snapshot.md#content-changed-reload-and-reconfigure).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.reloadItemsWithIdentifiers(['pear']);
```

**Effect**: The next time this snapshot is passed to `applySnapshot()`, the "pear" row gets a new cell and is fetched again.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot reloadItemsWithIdentifiers…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
