---
type: reference
native: UICollectionView.allowsMultipleSelection
---

# `UICollectionView`: `allowsMultipleSelection` property

The **`allowsMultipleSelection`** property indicates whether multiple items can be selected at the same time.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Multiple items can be selected at once; tapping again deselects |
| `false` | Selecting an item deselects the previous one |

- Readable and writable.
- Defaults to `false`.
- No change event: only the app's own code changes it.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.allowsMultipleSelection = true;
list.addEventListener('itemdeselect', (event) => console.log('Deselected', event.indexPath.item));
```

**Effect**: several rows can be selected. Tapping a selected row again deselects it, and the console prints its index. **Not verified in the simulator.**

## Corresponding iOS API

`UICollectionView.allowsMultipleSelection`.

## See also

- [`indexPathsForSelectedItems`](indexpathsforselecteditems.md)
