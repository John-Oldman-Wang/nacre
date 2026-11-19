---
type: reference
native: "-[NSDiffableDataSourceSnapshot appendItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`: `appendItemsWithIdentifiers()` method

The **`appendItemsWithIdentifiers()`** method adds items at the end of a section.

## Syntax

```
appendItemsWithIdentifiers(itemIdentifiers)
appendItemsWithIdentifiers(itemIdentifiers, { intoSectionWithIdentifier })
```

### Parameters

**`itemIdentifiers`**

An array of identifiers. Each identifier is a string or an integer.

**`options.intoSectionWithIdentifier`**

The identifier of the section to add to. Optional; when omitted, the items are added to the last section.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

| Case | Error |
| --- | --- |
| There are no sections yet | `appendItemsWithIdentifiers: the snapshot has no sections; append a section first` |
| The section referred to doesn't exist | `appendItemsWithIdentifiers: there is no section with identifier "nope"` |
| An identifier being added is already in the snapshot | `appendItemsWithIdentifiers: item identifier "pear" is already in the snapshot` |
| An identifier appears twice in the same call | `appendItemsWithIdentifiers: item identifier "x" appears more than once` |
| An identifier isn't a string or an integer (a fraction, an object, `null`) | `appendItemsWithIdentifiers: identifiers must be strings or integers, got 1.5` |
| The argument isn't an array | `appendItemsWithIdentifiers needs an array of identifiers` |

On error the snapshot is left unchanged; none of the identifiers in that call are added.

## Examples

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.appendItemsWithIdentifiers(['plum'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['leek']);
console.log(snapshot.itemIdentifiers.join(','));
```

**Result**: Prints `apple,pear,plum,kale,leek`.

## Corresponding iOS API

`-[NSDiffableDataSourceSnapshot appendItemsWithIdentifiers…]`.

## See also

- [Common rules for mutating methods](../ns-diffable-data-source-snapshot.md#common-rules-for-mutating-methods)
