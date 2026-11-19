---
type: reference
native: "-[UICollectionViewDiffableDataSource applySnapshotUsingReloadData:completion:]"
---

# `UICollectionViewDiffableDataSource`：`applySnapshotUsingReloadData()` 方法

**`applySnapshotUsingReloadData()`** 方法让列表显示一份快照，不算差异，整个重新加载。数据整体换掉、不需要逐行动画时用。

## 语法

```
applySnapshotUsingReloadData(snapshot)
```

### 参数

**`snapshot`**

要显示的快照，[`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)。

### 返回值

`Promise<void>`。列表更新完时兑现。

### 异常

**`TypeError`**

`snapshot` 不是快照（比如 `null`）：`applySnapshotUsingReloadData needs a NSDiffableDataSourceSnapshot`。这时直接抛，不返回 Promise。

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
const fresh = new NSDiffableDataSourceSnapshot();
fresh.appendSectionsWithIdentifiers(['main']);
fresh.appendItemsWithIdentifiers(['B1', 'B2']);
await source.applySnapshotUsingReloadData(fresh);
```

**效果**：列表直接显示新的两行，没有插入和删除的动画。

## 对应的 iOS API

`-[UICollectionViewDiffableDataSource applySnapshotUsingReloadData:completion:]`。`completion:` 换成了返回的 Promise。

## 参见

- [`applySnapshot()`](applysnapshot.md)
