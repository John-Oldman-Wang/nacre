---
type: reference
native: "-[NSDiffableDataSourceSnapshot moveSectionWithIdentifier]"
---

# `NSDiffableDataSourceSnapshot`: `moveSectionWithIdentifier()` method

The **`moveSectionWithIdentifier()`** method moves a section before or after another section; its items move with it.

## Syntax

```
moveSectionWithIdentifier(sectionIdentifier, { beforeSectionWithIdentifier })
moveSectionWithIdentifier(sectionIdentifier, { afterSectionWithIdentifier })
```

### Parameters

**`sectionIdentifier`**

The identifier of the section to move.

**`options.beforeSectionWithIdentifier`**, **`options.afterSectionWithIdentifier`**

The identifier of the section to place it before or after. Exactly one of the two keys must be given.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The section to move or the section referred to doesn't exist (measured).
- Neither or both of `before…` and `after…` given.

On error the snapshot is left unchanged; none of the identifiers in that call are added. For the common errors, see [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods).

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.moveSectionWithIdentifier('veg', { beforeSectionWithIdentifier: 'fruit' });
console.log(snapshot.itemIdentifiers.join(','));
```

**Result**: Prints `kale,apple,pear`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot moveSectionWithIdentifier…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
