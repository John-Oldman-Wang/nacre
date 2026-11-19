---
type: reference
native: "-[NSDiffableDataSourceSnapshot init]"
---

# `NSDiffableDataSourceSnapshot()` constructor

The **`NSDiffableDataSourceSnapshot()`** constructor creates an empty snapshot, with no sections and no items.

## Syntax

```
new NSDiffableDataSourceSnapshot()
```

### Parameters

None.

### Return value

A new `NSDiffableDataSourceSnapshot`. Both `numberOfSections` and `numberOfItems` are `0` (measured).

### Exceptions

None.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
console.log(snapshot.numberOfSections, snapshot.numberOfItems);
```

**Result**: Prints `0 0`.

## Corresponding iOS API

`[[NSDiffableDataSourceSnapshot alloc] init]`.

## See also

- [`appendSectionsWithIdentifiers()`](appendsectionswithidentifiers.md): add sections first, then items
