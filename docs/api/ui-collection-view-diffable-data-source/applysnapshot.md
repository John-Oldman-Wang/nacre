---
type: reference
native: "-[UICollectionViewDiffableDataSource applySnapshot:animatingDifferences:completion:]"
---

# `UICollectionViewDiffableDataSource`：`applySnapshot()` 方法

**`applySnapshot()`** 方法让列表显示一份快照。系统比较它和现在的数据，算出哪些行要插入、删除、移动。

## 语法

```
applySnapshot(snapshot)
applySnapshot(snapshot, { animatingDifferences })
```

### 参数

**`snapshot`**

要显示的快照，[`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)。

**`options.animatingDifferences`**

布尔，可以不传。默认 `true`：差异带动画。第一次放数据时通常写 `false`。

### 返回值

`Promise<void>`。列表更新完时兑现，带动画时是动画结束的时候。实测带动画的一次更新大约半秒后兑现。

调用返回时 `cellProvider` 可能已经被调过了。

### 异常

**`TypeError`**

`snapshot` 不是快照：`applySnapshot needs a NSDiffableDataSourceSnapshot`。这时直接抛，不返回 Promise。

## 示例

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
const first = new NSDiffableDataSourceSnapshot();
first.appendSectionsWithIdentifiers(['main']);
first.appendItemsWithIdentifiers(['A1001', 'A1002', 'A1003']);
await source.applySnapshot(first, { animatingDifferences: false });
const next = source.snapshot();
next.deleteItemsWithIdentifiers(['A1003']);
await source.applySnapshot(next);
list.scrollToItemAtIndexPath({ section: 0, item: 0 }, { atScrollPosition: ['top'] });
```

**效果**：「A1003」那一行消失的动画结束后，列表滚回最上面。

## 对应的 iOS API

`-[UICollectionViewDiffableDataSource applySnapshot:animatingDifferences:completion:]`。`completion:` 换成了返回的 Promise。

## 参见

- [`applySnapshotUsingReloadData()`](applysnapshotusingreloaddata.md)
- [`snapshot()`](snapshot.md)
