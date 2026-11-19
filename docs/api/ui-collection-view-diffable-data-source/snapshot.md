---
type: reference
native: "-[UICollectionViewDiffableDataSource snapshot]"
---

# `UICollectionViewDiffableDataSource`：`snapshot()` 方法

**`snapshot()`** 方法返回列表现在的数据的一份副本。

## 语法

```
snapshot()
```

### 参数

无。

### 返回值

[`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)。改它不影响列表，改完要交给 [`applySnapshot()`](applysnapshot.md)。

### 异常

无。

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
next.deleteItemsWithIdentifiers(['A1001']);
console.log(next.numberOfItems, source.snapshot().numberOfItems);
await source.applySnapshot(next);
```

**结果**：输出 `2 3`：副本少了一项，列表还是三项。最后一行之后第一行带动画地消失。

## 对应的 iOS API

`-[UICollectionViewDiffableDataSource snapshot]`。

## 参见

- [`applySnapshot()`](applysnapshot.md)
