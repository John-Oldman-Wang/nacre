---
type: reference
native: NSDiffableDataSourceSnapshot
status: partial
---

# `NSDiffableDataSourceSnapshot`

**`NSDiffableDataSourceSnapshot`** represents an inventory of a list's data: which sections there are, which items are in each section, and in what order. It holds only [identifiers](ui-collection-view.md#identifiers), not content; the content is looked up by identifier in the data source's `cellProvider`.

A snapshot is just data, and changing it doesn't affect the screen. The list changes only after the snapshot is handed to the data source's [`applySnapshot()`](ui-collection-view-diffable-data-source/applysnapshot.md).

There are two ways to get a snapshot:

| How | What you get | When to use it |
| --- | --- | --- |
| [`new NSDiffableDataSourceSnapshot()`](ns-diffable-data-source-snapshot/constructor.md) | An empty snapshot | Putting data in for the first time; replacing all the data |
| [`source.snapshot()`](ui-collection-view-diffable-data-source/snapshot.md) | A copy of the list's current data | Adding, deleting, or changing items in the existing data |

**Inheritance**: `EventTarget` → `NSObject` → `NSDiffableDataSourceSnapshot`

## Constructor

[`NSDiffableDataSourceSnapshot()`](ns-diffable-data-source-snapshot/constructor.md)

Creates an empty snapshot.

## Instance properties

| Property | Description |
| --- | --- |
| [`numberOfSections`](ns-diffable-data-source-snapshot/numberofsections.md) <small>read-only</small> | The total number of sections |
| [`numberOfItems`](ns-diffable-data-source-snapshot/numberofitems.md) <small>read-only</small> | The total number of items |
| [`sectionIdentifiers`](ns-diffable-data-source-snapshot/sectionidentifiers.md) <small>read-only</small> | The identifiers of all sections, in order |
| [`itemIdentifiers`](ns-diffable-data-source-snapshot/itemidentifiers.md) <small>read-only</small> | The identifiers of all items, concatenated in section order |

## Instance methods

Queries:

| Method | Description |
| --- | --- |
| [`numberOfItemsInSection()`](ns-diffable-data-source-snapshot/numberofitemsinsection.md) | How many items a section has |
| [`itemIdentifiersInSectionWithIdentifier()`](ns-diffable-data-source-snapshot/itemidentifiersinsectionwithidentifier.md) | The identifiers of the items in a section |
| [`sectionIdentifierForSectionContainingItemIdentifier()`](ns-diffable-data-source-snapshot/sectionidentifierforsectioncontainingitemidentifier.md) | Which section an item is in |
| [`indexOfItemIdentifier()`](ns-diffable-data-source-snapshot/indexofitemidentifier.md) | An item's position among all items |
| [`indexOfSectionIdentifier()`](ns-diffable-data-source-snapshot/indexofsectionidentifier.md) | A section's position |

Changing sections:

| Method | Description |
| --- | --- |
| [`appendSectionsWithIdentifiers()`](ns-diffable-data-source-snapshot/appendsectionswithidentifiers.md) | Adds sections at the end |
| [`insertSectionsWithIdentifiers()`](ns-diffable-data-source-snapshot/insertsectionswithidentifiers.md) | Inserts sections before or after a given section |
| [`deleteSectionsWithIdentifiers()`](ns-diffable-data-source-snapshot/deletesectionswithidentifiers.md) | Deletes sections and the items in them |
| [`moveSectionWithIdentifier()`](ns-diffable-data-source-snapshot/movesectionwithidentifier.md) | Moves a section before or after another |
| [`reloadSectionsWithIdentifiers()`](ns-diffable-data-source-snapshot/reloadsectionswithidentifiers.md) | Marks the content of the items in some sections as changed |

Changing items:

| Method | Description |
| --- | --- |
| [`appendItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/appenditemswithidentifiers.md) | Adds items at the end of a section |
| [`insertItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/insertitemswithidentifiers.md) | Inserts items before or after a given item |
| [`deleteItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/deleteitemswithidentifiers.md) | Deletes items |
| [`deleteAllItems()`](ns-diffable-data-source-snapshot/deleteallitems.md) | Deletes all sections and items |
| [`moveItemWithIdentifier()`](ns-diffable-data-source-snapshot/moveitemwithidentifier.md) | Moves an item before or after another |
| [`reloadItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/reloaditemswithidentifiers.md) | Marks items' content as changed; a new cell is used when applied |
| [`reconfigureItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/reconfigureitemswithidentifiers.md) | Marks items' content as changed; the existing cell is reused when applied |

## Common rules for mutating methods

- None of them return a value. Parameters that take a group of identifiers are all arrays.
- For methods that take a `before…` key and an `after…` key, exactly one of the two must be given.
- On error they all throw `TypeError`, with a message that starts with the method name. On error the snapshot is left unchanged; none of the identifiers in that call are added.

| Case | Error |
| --- | --- |
| An identifier isn't a string or an integer | `appendItemsWithIdentifiers: identifiers must be strings or integers, got 1.5` |
| A non-array where an array is expected | `appendItemsWithIdentifiers needs an array of identifiers` |
| An identifier being added is already in the snapshot | `appendItemsWithIdentifiers: item identifier "pear" is already in the snapshot` |
| An identifier appears twice in the same call | `appendItemsWithIdentifiers: item identifier "x" appears more than once` |
| The section referred to doesn't exist | `appendItemsWithIdentifiers: there is no section with identifier "nope"` |
| The item referred to doesn't exist (insertion position, move, reload, reconfigure) | `insertItemsWithIdentifiers: there is no item with identifier "nope"` |
| Neither or both of `before…` and `after…` given | `insertItemsWithIdentifiers needs exactly one of { beforeItemWithIdentifier } or { afterItemWithIdentifier }` |

## Content changed: `reload` and `reconfigure`

[`reloadItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/reloaditemswithidentifiers.md) and [`reconfigureItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/reconfigureitemswithidentifiers.md) both mean "this item's content has changed". They differ in how cells are handled:

| Method | When the snapshot is applied |
| --- | --- |
| `reconfigureItemsWithIdentifiers()` | Calls `cellProvider` again on the existing cell. Usually the one to use |
| `reloadItemsWithIdentifiers()` | Uses a new cell, then calls `cellProvider` |

Changing only the data the app keeps itself doesn't change the list: the snapshot holds only identifiers, and when the identifiers haven't changed, the system assumes there's nothing to update.

## Examples

### Two sections

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['unpaid', 'done']);
snapshot.appendItemsWithIdentifiers(['A1002'], { intoSectionWithIdentifier: 'unpaid' });
snapshot.appendItemsWithIdentifiers(['A1001', 'A1003'], { intoSectionWithIdentifier: 'done' });
console.log(snapshot.numberOfSections, snapshot.numberOfItems, snapshot.itemIdentifiers.join(','));
```

**Result**: Prints `2 3 A1002,A1001,A1003`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[NSDiffableDataSourceSnapshot alloc] init]` | `new NSDiffableDataSourceSnapshot()` |
| `[snapshot appendItemsWithIdentifiers:ids intoSectionWithIdentifier:@"main"]` | `snapshot.appendItemsWithIdentifiers(ids, { intoSectionWithIdentifier: 'main' })` |
| `[snapshot insertItemsWithIdentifiers:ids beforeItemWithIdentifier:@"x"]` | `snapshot.insertItemsWithIdentifiers(ids, { beforeItemWithIdentifier: 'x' })` |

In ObjC an identifier can be any hashable object; in JS it's a string or an integer. `NSNotFound` is replaced by -1. Where the system throws an exception that crashes the app on misuse, JS throws a `TypeError` you can `catch`.

## See also

- [`UICollectionViewDiffableDataSource`](ui-collection-view-diffable-data-source.md): hands the snapshot to the list
- [Building a list](../guides/lists.md): how to add, delete, and change rows
