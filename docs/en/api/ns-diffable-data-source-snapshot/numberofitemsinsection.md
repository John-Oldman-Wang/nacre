---
type: reference
native: "-[NSDiffableDataSourceSnapshot numberOfItemsInSection:]"
---

# `NSDiffableDataSourceSnapshot`: `numberOfItemsInSection()` method

The **`numberOfItemsInSection()`** method returns how many items a section has.

## Syntax

```
numberOfItemsInSection(sectionIdentifier)
```

### Parameters

**`sectionIdentifier`**

The section's identifier.

### Return value

A number: a count.

### Exceptions

**`TypeError`**

There's no such section (measured): `numberOfItemsInSection: there is no section with identifier "nope"`, starting with the method name.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.numberOfItemsInSection('fruit'));
```

**Result**: Prints `2`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot numberOfItemsInSection:]`.

## See also

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
