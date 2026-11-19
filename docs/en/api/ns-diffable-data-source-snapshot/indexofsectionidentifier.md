---
type: reference
native: "-[NSDiffableDataSourceSnapshot indexOfSectionIdentifier:]"
---

# `NSDiffableDataSourceSnapshot`: `indexOfSectionIdentifier()` method

The **`indexOfSectionIdentifier()`** method returns a section's position.

## Syntax

```
indexOfSectionIdentifier(sectionIdentifier)
```

### Parameters

**`sectionIdentifier`**

The section's identifier.

### Return value

A number counted from 0. `-1` if there's no such section.

### Exceptions

None.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.indexOfSectionIdentifier('veg'));
```

**Result**: Prints `1`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot indexOfSectionIdentifier:]`. `NSNotFound` is replaced by -1.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
