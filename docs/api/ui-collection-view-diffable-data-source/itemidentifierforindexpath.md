---
type: reference
native: "-[UICollectionViewDiffableDataSource itemIdentifierForIndexPath:]"
---

# `UICollectionViewDiffableDataSource`：`itemIdentifierForIndexPath()` 方法

**`itemIdentifierForIndexPath()`** 方法返回某个位置上是哪一项。查的是列表现在的数据，也就是最后一次 `applySnapshot()` 交进去的那一份。

## 语法

```
itemIdentifierForIndexPath(indexPath)
```

### 参数

**`indexPath`**

位置，[`NSIndexPath`](../ns-index-path.md) 或 `{ section, item }`。

### 返回值

[标识](../ui-collection-view.md#标识)（字符串或整数），或者 `null`。没有这个位置返回 `null`（实测）。

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
console.log(source.itemIdentifierForIndexPath({ section: 0, item: 1 }), source.itemIdentifierForIndexPath({ section: 0, item: 400 }));
```

**结果**：输出 `A1002 null`。

## 对应的 iOS API

`-[UICollectionViewDiffableDataSource itemIdentifierForIndexPath:]`。

## 参见

- [分区和项](../ui-collection-view.md#分区和项)
