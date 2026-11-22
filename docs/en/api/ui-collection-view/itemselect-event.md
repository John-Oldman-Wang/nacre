---
type: reference
native: "UICollectionViewDelegate collectionView:didSelectItemAtIndexPath:"
---

# `UICollectionView`: `itemselect` event

The **`itemselect`** event fires when the user selects an item.

## Syntax

```
list.addEventListener('itemselect', (event) => { })
```

## Event object

[`UICollectionViewItemEvent`](../ui-collection-view-item-event.md). `type` is the event name, `target` is the list, and there's one extra read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`indexPath`](../ui-collection-view-item-event/indexpath.md) | [`NSIndexPath`](../ns-index-path.md) | The item's position at the moment the event occurred |

Not cancelable; `preventDefault()` has no effect.

## When it fires

- When the user taps a row. **Not verified in the simulator**: selection can only be triggered by a real touch.
- Doesn't fire when [`allowsSelection`](allowsselection.md) is `false`.
- Calling [`selectItemAtIndexPath()`](selectitematindexpath.md) from code doesn't fire it (verified by testing).
- The callback runs after the current round of code. If the data changes before the callback runs, the position `indexPath` may now hold a different item or no item. First convert it to an identifier with [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md); a result of `null` means the position no longer has an item.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });
const source = new UICollectionViewDiffableDataSource(list, {
  cellProvider(collectionView, indexPath, id) {
    const cell = collectionView.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath });
    const content = cell.defaultContentConfiguration();
    content.text = String(id);
    cell.contentConfiguration = content;
    return cell;
  },
});
list.addEventListener('itemselect', (event) => {
  const id = source.itemIdentifierForIndexPath(event.indexPath);
  if (id === null) return;
  console.log('Tapped ' + id);
  list.deselectItemAtIndexPath(event.indexPath, { animated: true });
});
```

**Effect**: tapping a row prints its identifier to the console, and the row's highlight fades out. **Not verified in the simulator.**

## Corresponding iOS API

`collectionView:didSelectItemAtIndexPath:` of `UICollectionViewDelegate`.

## See also

- [`itemdeselect`](itemdeselect-event.md)
