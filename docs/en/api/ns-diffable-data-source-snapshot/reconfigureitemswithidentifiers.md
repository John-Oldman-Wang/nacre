---
type: reference
native: "-[NSDiffableDataSourceSnapshot reconfigureItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`: `reconfigureItemsWithIdentifiers()` method

The **`reconfigureItemsWithIdentifiers()`** method marks the content of some items as changed. When the snapshot is applied, `cellProvider` is called again on the existing cell.

## Syntax

```
reconfigureItemsWithIdentifiers(itemIdentifiers)
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

This is usually the one to use when content changes. Update the data the app keeps itself first, then call it; changing only the data doesn't change the list. See [Content changed: `reload` and `reconfigure`](../ns-diffable-data-source-snapshot.md#content-changed-reload-and-reconfigure).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.reconfigureItemsWithIdentifiers(['apple']);
```

**Effect**: The next time this snapshot is passed to `applySnapshot()`, the system calls `cellProvider` again for "apple". Measured: in that call, `cellProvider` gets the same cell the row had before.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot reconfigureItemsWithIdentifiers…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
