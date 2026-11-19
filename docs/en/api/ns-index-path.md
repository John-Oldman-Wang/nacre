---
type: reference
native: NSIndexPath
---

# `NSIndexPath`

**`NSIndexPath`** represents the position of an item in a list: item number [`item`](ns-index-path/item.md) in section number [`section`](ns-index-path/section.md), both counted from 0.

A position changes with the data: insert a row before an item and its position changes. To remember an item over time, store its [identifier](ui-collection-view.md#identifiers) and convert it to a position when needed with the data source's [`indexPathForItemIdentifier()`](ui-collection-view-diffable-data-source/indexpathforitemidentifier.md).

`NSIndexPath` is a read-only value of the same kind as [structs](structs.md):

- **Fields are read-only.** Writing throws `TypeError`.
- **Both numbers are non-negative integers.** Fractions are truncated toward zero; negative numbers and values that can't be converted to numbers throw `TypeError`.
- **Parameters that take a position also accept a plain object.** `{ section: 0, item: 3 }` is equivalent to `new NSIndexPath(0, 3)`. What you read back is always an `NSIndexPath`.
- **Converted to a string**, it is `'NSIndexPath(0, 3)'`.

**Inheritance**: `NSIndexPath`. It does not inherit from `NSObject`.

## Constructor

[`NSIndexPath()`](ns-index-path/constructor.md)

Creates a position from a section number and an item number. The section comes first, then the item.

## Static methods

[`NSIndexPath.indexPathForItem()`](ns-index-path/indexpathforitem.md)

Same order as in ObjC: the item first, then the section.

[`NSIndexPath.indexPathForRow()`](ns-index-path/indexpathforrow.md)

Same as the previous one, named with row.

## Instance properties

| Property | Description |
| --- | --- |
| [`section`](ns-index-path/section.md) <small>read-only</small> | The section number, counted from 0 |
| [`item`](ns-index-path/item.md) <small>read-only</small> | The item number within the section, counted from 0 |
| [`row`](ns-index-path/row.md) <small>read-only</small> | The same number as `item` |

## Examples

```js
const a = new NSIndexPath(0, 3);
const b = NSIndexPath.indexPathForItem(3, { inSection: 0 });
console.log(String(a), a.section === b.section && a.item === b.item);
```

**Result**: logs `NSIndexPath(0, 3) true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[NSIndexPath indexPathForItem:3 inSection:0]` | `new NSIndexPath(0, 3)`, `NSIndexPath.indexPathForItem(3, { inSection: 0 })`, or `{ section: 0, item: 3 }` |
| `[NSIndexPath indexPathForRow:3 inSection:0]` | `NSIndexPath.indexPathForRow(3, { inSection: 0 })` |
| `path.section`, `path.item`, `path.row` | Same names |

The arguments of `new NSIndexPath(section, item)` are section first, then item, the opposite of ObjC's `indexPathForItem:inSection:`. ObjC's arbitrary-length `NSIndexPath` (`indexPathWithIndexes:length:`) is not provided.

## See also

- [`UICollectionView`](ui-collection-view.md): [Sections and items](ui-collection-view.md#sections-and-items)
- [Structs](structs.md)
